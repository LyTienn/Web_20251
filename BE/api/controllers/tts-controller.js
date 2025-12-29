import { GoogleGenAI } from "@google/genai";
import cloudinary from "../config/cloudinary-config.js";
import { Readable } from 'stream';
import Chapter from "../models/chapter-model.js";
import { Task } from "../models/index.js";
import { splitTextBySentence } from "../utils/text-splitter.js";
import wav from 'wav';
import Book from "../models/book-model.js";

// Background processing function
const processTTS = async (taskId, text, voiceName, chapterId) => {
    try {
        const task = await Task.findByPk(taskId);
        if (!task) return;

        await task.update({ status: 'PROCESSING' });

        // 1. Check if chapterId is provided & Check Cache
        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            if (chapter) {
                const audioLinks = chapter.audio_links || [];
                const cachedAudio = audioLinks.find(link => link.voice === voiceName);
                if (cachedAudio) {
                    await task.update({
                        status: 'COMPLETED',
                        result: {
                            audioUrl: cachedAudio.url,
                            voice: voiceName,
                            message: "Retrieved from cache"
                        }
                    });
                    return;
                }
            }
        }

        // 2. Validate text
        const textToSpeak = text || (chapterId ? (await Chapter.findByPk(chapterId))?.content : null);
        if (!textToSpeak) {
            throw new Error("Text or valid Chapter ID is required");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        // 3. Generate Speech (Chunked & Parallel)
        const chunks = splitTextBySentence(textToSpeak, 1000);
        console.log(`[Task ${taskId}] Splitting text into ${chunks.length} chunks for TTS.`);

        await task.update({
            progress: { current: 0, total: chunks.length, stage: 'processing' }
        });

        const ai = new GoogleGenAI({ apiKey });
        const voiceConfig = {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName },
                },
            },
        };

        const CONCURRENCY_LIMIT = 5;
        const chunkBuffers = new Array(chunks.length);
        let completedChunks = 0;

        for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
            const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
            const batchIndices = batch.map((_, idx) => i + idx);

            console.log(`[Task ${taskId}] Processing batch ${Math.ceil((i + 1) / CONCURRENCY_LIMIT)}/${Math.ceil(chunks.length / CONCURRENCY_LIMIT)} (Chunks ${batchIndices[0] + 1}-${batchIndices[batchIndices.length - 1] + 1})...`);

            await Promise.all(batch.map(async (chunk, batchIdx) => {
                try {
                    const globalIdx = i + batchIdx;
                    const models = ["gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"];
                    let success = false;

                    for (const model of models) {
                        let attempts = 0;
                        const maxAttempts = 3;

                        while (attempts < maxAttempts) {
                            try {
                                const response = await ai.models.generateContent({
                                    model: model,
                                    contents: [{ parts: [{ text: chunk }] }],
                                    config: voiceConfig,
                                });

                                const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

                                if (!data) {
                                    console.warn(`[Task ${taskId}] No audio data for chunk ${globalIdx + 1} using ${model}, skipping/retrying.`);
                                    // Treat no data as a failure to try next attempt/model? 
                                    // Or accept it as empty? Original code accepted it as empty buffer but that seems wrong if it's an error.
                                    // Original code: chunkBuffers[globalIdx] = Buffer.alloc(0);
                                    // If it returns no data, maybe we should retry?
                                    // Let's stick closer to original logic but if it's empty maybe we want to retry if it's unexpected.
                                    // For now, I'll assume if no data, we might want to try again or switch model.
                                    // But if the model says "success" but no data, it's tricky.
                                    // Let's throw error to force retry/switch if data is missing.
                                    throw new Error("No inline data in response");
                                } else {
                                    chunkBuffers[globalIdx] = Buffer.from(data, 'base64');
                                }
                                success = true;
                                break; // Success, exit retry loop
                            } catch (err) {
                                attempts++;
                                console.error(`[Task ${taskId}] Error processing chunk ${globalIdx + 1} with model ${model} (Attempt ${attempts}/${maxAttempts}):`, err.message);

                                if (attempts >= maxAttempts) {
                                    console.warn(`[Task ${taskId}] Failed all attempts with model ${model}. Switching if available.`);
                                } else {
                                    // Exponential backoff: 1s, 2s, 4s...
                                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
                                }
                            }
                        }
                        if (success) {
                            console.log(`[Task ${taskId}] Chunk ${globalIdx + 1} success with ${model}`);
                            break; // Success, exit model loop
                        }
                    }

                    if (!success) {
                        // If we want to handle partial failure gracefully, we could allow empty buffer, 
                        // but usually we want all chunks.
                        // Original code threw error if final buffer was empty, but loop threw err if maxAttempts reached.
                        throw new Error(`Failed to generate chunk ${globalIdx + 1} after trying all models.`);
                    }
                } finally {
                    completedChunks++;
                }
            }));

            // Update progress
            await task.update({
                progress: { current: completedChunks, total: chunks.length, stage: 'processing' }
            });
        }

        const combinedBuffer = Buffer.concat(chunkBuffers);

        if (combinedBuffer.length === 0) {
            throw new Error("No audio data generated from any chunk");
        }

        const audioBuffer = combinedBuffer;

        // Update progress before upload
        await task.update({
            progress: { current: chunks.length, total: chunks.length, stage: 'uploading' }
        });

        // 4. Upload to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const cloudStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "tts_audio",
                        resource_type: "video",
                        public_id: `chapter_${chapterId || 'temp'}_${voiceName}_${Date.now()}`
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                const wavWriter = new wav.Writer({
                    channels: 1,
                    sampleRate: 24000,
                    bitDepth: 16
                });

                wavWriter.pipe(cloudStream);
                wavWriter.end(audioBuffer);
            });
        };

        const result = await uploadStream();
        const audioUrl = result.secure_url;

        // 5. Update Database if chapterId exists
        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            let currentLinks = chapter.audio_links || [];
            if (!Array.isArray(currentLinks)) currentLinks = [];
            currentLinks = currentLinks.filter(link => link.voice !== voiceName);
            currentLinks.push({ voice: voiceName, url: audioUrl });
            await chapter.update({ audio_links: currentLinks });
        }

        // 6. Update Task Status
        await task.update({
            status: 'COMPLETED',
            progress: { current: chunks.length, total: chunks.length, stage: 'completed' },
            result: {
                audioUrl: audioUrl,
                voice: voiceName,
                message: "Audio generated and uploaded successfully"
            }
        });
        console.log(`[Task ${taskId}] Completed successfully.`);

    } catch (error) {
        console.error(`[Task ${taskId}] Failed:`, error);
        await Task.update({
            status: 'FAILED',
            error: error.message
        }, {
            where: { id: taskId }
        });
    }
};

export const generateSpeech = async (req, res) => {
    try {
        const { text, voiceName = 'Kore', chapterId } = req.body;

        // Check if chapterId is provided & Check Cache
        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            if (chapter) {
                const audioLinks = chapter.audio_links || [];
                const cachedAudio = audioLinks.find(link => link.voice === voiceName);
                if (cachedAudio) {
                    return res.status(200).json({
                        audioUrl: cachedAudio.url,
                        message: "Retrieved from cache",
                        voice: voiceName
                    });
                }
            }
        }

        // Fetch context information
        let bookTitle = null;
        let chapterTitle = null;
        let bookId = null;

        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId, {
                include: [{ association: 'book', attributes: ['id', 'title'] }]
            });
            if (chapter) {
                chapterTitle = chapter.title;
                if (chapter.book) {
                    bookId = chapter.book.id;
                    bookTitle = chapter.book.title;
                }
            }
        }

        // Create Task
        const task = await Task.create({
            type: 'TTS',
            status: 'PENDING',
            chapter_id: chapterId || null,
            book_id: bookId,
            book_title: bookTitle,
            chapter_title: chapterTitle,
            voice_name: voiceName,
        });

        // Respond immediately
        res.status(202).json({
            taskId: task.id,
            message: "TTS generation started",
            status: "PENDING"
        });

        // Trigger background processing
        processTTS(task.id, text, voiceName, chapterId);

    } catch (error) {
        console.error("Error initiating TTS task:", error);
        res.status(500).json({ message: "Failed to initiate TTS task", error: error.message });
    }
};

const VOICES = [
    { name: "Zephyr", description: "Nam giọng sáng trẻ trung linh hoạt" },
    { name: "Puck", description: "Nam giọng cao rộn ràng vui tươi" },
    { name: "Charon", description: "Nam giọng trầm quyền lực âm u" },
    { name: "Kore", description: "Nữ giọng trầm vững chắc điềm tĩnh" },
    { name: "Fenrir", description: "Nam giọng mạnh sôi nổi đầy năng lượng" },
    { name: "Leda", description: "Nữ giọng trẻ trung trong sáng nhẹ nhàng" },
    { name: "Orus", description: "Nam giọng chắc khỏe rõ ràng tự tin" },
    { name: "Aoede", description: "Nữ giọng nhẹ nhàng êm ái dễ nghe" },
    { name: "Callirrhoe", description: "Nữ giọng dịu dàng dễ chịu tự nhiên" },
    { name: "Autonoe", description: "Nữ giọng sáng rõ linh hoạt trẻ trung" },
    { name: "Enceladus", description: "Nam giọng thở gấp căng thẳng dữ dội" },
    { name: "Iapetus", description: "Nam giọng rõ ràng mạch lạc chuẩn xác" },
    { name: "Umbriel", description: "Nam giọng trầm dễ tính chậm rãi" },
    { name: "Algieba", description: "Nam giọng mượt mà trầm ấm ổn định" },
    { name: "Despina", description: "Nữ giọng mượt mà mềm mại tự nhiên" },
    { name: "Erinome", description: "Nữ giọng trong trẻo cao nhẹ tinh tế" },
    { name: "Algenib", description: "Nam giọng khàn khàn thô ráp cá tính" },
    { name: "Rasalgethi", description: "Nữ giọng dữ dội hoang dã đầy uy lực" },
    { name: "Laomedeia", description: "Nữ giọng rộn ràng hoạt bát vui vẻ" },
    { name: "Achernar", description: "Nam giọng mềm mại trầm ấm dễ nghe" },
    { name: "Alnilam", description: "Nam giọng vững chắc ổn định đáng tin" },
    { name: "Schedar", description: "Nam giọng đều đặn chậm rãi rõ ràng" },
    { name: "Gacrux", description: "Nam giọng trưởng thành trầm ổn chín chắn" },
    { name: "Pulcherrima", description: "Nữ giọng lạc quan tươi sáng tích cực" },
    { name: "Achird", description: "Nam giọng thân thiện gần gũi dễ mến" },
    { name: "Zubenelgenubi", description: "Nam giọng trung tính bình thường dễ nghe" },
    { name: "Vindemiatrix", description: "Nữ giọng êm dịu nhẹ nhàng thư giãn" },
    { name: "Sadachbia", description: "Nam giọng sống động linh hoạt giàu cảm xúc" },
    { name: "Sadaltager", description: "Nam giọng hiểu biết chín chắn đáng tin" },
    { name: "Sulafat", description: "Nữ giọng ấm áp dịu dàng đầy cảm xúc" }
];

export const getVoices = async (req, res) => {
    try {
        const { chapterId } = req.query;
        let availableVoices = {}; // Map voiceName -> audioUrl

        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            if (chapter && Array.isArray(chapter.audio_links)) {
                chapter.audio_links.forEach(link => {
                    availableVoices[link.voice] = link.url;
                });
            }
        }

        const voicesWithStatus = VOICES.map(voice => ({
            ...voice,
            isAvailable: !!availableVoices[voice.name],
            audioUrl: availableVoices[voice.name] || null
        }));

        res.status(200).json(voicesWithStatus);
    } catch (error) {
        console.error("Error fetching voices:", error);
        res.status(500).json({ message: "Failed to fetch voices" });
    }
};
