import { GoogleGenAI } from "@google/genai";
import cloudinary from "../config/cloudinary-config.js";
import { Readable } from 'stream';
import Chapter from "../models/chapter-model.js";

export const generateSpeech = async (req, res) => {
    try {
        const { text, voiceName = 'Kore', chapterId } = req.body;

        // 1. Check if chapterId is provided
        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            if (!chapter) {
                return res.status(404).json({ message: "Chapter not found" });
            }

            // 2. Check cache in database
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

        // 3. Validate text if not cached
        const textToSpeak = text || (chapterId ? (await Chapter.findByPk(chapterId))?.content : null);

        if (!textToSpeak) {
            return res.status(400).json({ message: "Text or valid Chapter ID is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });
        }

        // 4. Generate Speech
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!data) {
            throw new Error("No audio data received from Gemini");
        }

        const audioBuffer = Buffer.from(data, 'base64');

        // 5. Upload to Cloudinary
        const uploadStream = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "tts_audio",
                        resource_type: "auto",
                        public_id: `chapter_${chapterId || 'temp'}_${voiceName}_${Date.now()}`
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                Readable.from(buffer).pipe(stream);
            });
        };

        const result = await uploadStream(audioBuffer);
        const audioUrl = result.secure_url;

        // 6. Update Database if chapterId exists
        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            let currentLinks = chapter.audio_links || [];
            if (!Array.isArray(currentLinks)) currentLinks = [];

            // Remove old link for same voice if exists
            currentLinks = currentLinks.filter(link => link.voice !== voiceName);

            // Add new link
            currentLinks.push({ voice: voiceName, url: audioUrl });

            await chapter.update({ audio_links: currentLinks });
        }

        res.status(200).json({
            audioUrl: audioUrl,
            message: "Audio generated and uploaded successfully",
            voice: voiceName
        });

    } catch (error) {
        console.error("Error generating speech:", error);
        res.status(500).json({ message: "Failed to generate speech", error: error.message });
    }
};

const VOICES = [
    { name: "Zephyr", description: "Tươi sáng" },
    { name: "Puck", description: "Rộn ràng" },
    { name: "Charon", description: "Cung cấp nhiều thông tin" },
    { name: "Kore", description: "Firm" },
    { name: "Fenrir", description: "Dễ kích động" },
    { name: "Leda", description: "Trẻ trung" },
    { name: "Orus", description: "Firm" },
    { name: "Aoede", description: "Breezy" },
    { name: "Callirrhoe", description: "Dễ chịu" },
    { name: "Autonoe", description: "Tươi sáng" },
    { name: "Enceladus", description: "Breathy" },
    { name: "Iapetus", description: "Rõ ràng" },
    { name: "Umbriel", description: "Dễ tính" },
    { name: "Algieba", description: "Làm mịn" },
    { name: "Despina", description: "Smooth (Mượt mà)" },
    { name: "Erinome", description: "Clear" },
    { name: "Algenib", description: "Khàn" },
    { name: "Rasalgethi", description: "Cung cấp nhiều thông tin" },
    { name: "Laomedeia", description: "Rộn ràng" },
    { name: "Achernar", description: "Mềm" },
    { name: "Alnilam", description: "Firm" },
    { name: "Schedar", description: "Even" },
    { name: "Gacrux", description: "Người trưởng thành" },
    { name: "Pulcherrima", description: "Lạc quan" },
    { name: "Achird", description: "Thân thiện" },
    { name: "Zubenelgenubi", description: "Thông thường" },
    { name: "Vindemiatrix", description: "Êm dịu" },
    { name: "Sadachbia", description: "Lively" },
    { name: "Sadaltager", description: "Hiểu biết" },
    { name: "Sulafat", description: "Ấm" }
];

export const getVoices = async (req, res) => {
    console.log("GET /voices request received");
    res.status(200).json(VOICES);
};
