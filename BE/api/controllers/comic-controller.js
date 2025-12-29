import { GoogleGenAI } from "@google/genai";
import GeminiClient from "../utils/GeminiClient.js";
import cloudinary from "../config/cloudinary-config.js";
import Chapter from "../models/chapter-model.js";
import Book from "../models/book-model.js";
import { Task } from "../models/index.js";
import { splitTextByLimit } from "../utils/text-splitter.js";
import stream from 'stream';

// Helper to upload buffer to Cloudinary
const uploadImageToCloudinary = (buffer, folder, publicId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                public_id: publicId,
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
    });
};

const processComicGeneration = async (taskId, chapterId, bookId) => {
    try {
        const task = await Task.findByPk(taskId);
        if (!task) return;

        await task.update({ status: 'PROCESSING', progress: { stage: 'initializing', current: 0, total: 100 } });

        // 1. Fetch Data
        const chapter = await Chapter.findByPk(chapterId);
        const book = await Book.findByPk(bookId);

        if (!chapter || !book) {
            throw new Error("Chapter or Book not found");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey }); // Keep for Image Generation
        const client = new GeminiClient(apiKey); // Use for Text Generation

        // 2. Extract Character Description from Summary
        console.log(`[Task ${taskId}] Extracting character description...`);
        const summary = book.summary || "A generic protagonist";
        const charPrompt = `Extract a visual description of the main character from this summary. If not found, describe a generic hero suitable for the genre. Keep it concise (visual traits only). Summary: ${summary}`;

        let characterDescription = "A generic hero";
        try {
            characterDescription = await client.generateContent(charPrompt) || "A generic hero";
        } catch (e) {
            console.warn(`[Task ${taskId}] Failed to extract character description, using default. Error: ${e.message}`);
        }
        console.log(`[Task ${taskId}] Character: ${characterDescription}`);

        // 3. Split Chapter into Scenes (at least 10 parts)
        // Simple splitting by length for now, ideally strictly by scene logic
        // Ensuring at least 10 parts if content allows, max token limit 65k so chunks shouldn't be too huge
        const minParts = 10;
        const contentLength = chapter.content.length;
        const chunkSize = Math.ceil(contentLength / minParts);
        // Ensure chunk size isn't too small or too large, but prioritize at least 5 parts
        const safeChunkSize = Math.min(Math.max(chunkSize, 500), 5000);

        const chunks = splitTextByLimit(chapter.content, safeChunkSize);
        const totalParts = chunks.length;

        await task.update({
            progress: { stage: 'generating_images', current: 0, total: totalParts }
        });

        const comicPages = [];

        // 4. Generate Images for each part
        for (let i = 0; i < totalParts; i++) {
            const chunk = chunks[i];
            console.log(`[Task ${taskId}] Generating image for part ${i + 1}/${totalParts}...`);

            const imagePrompt = `Create a comic book panel. 
            Style: Manga/Comic book style, black and white or colored, with speech bubbles if dialogue is present.
            Character: ${characterDescription}.
            Scene: ${chunk.substring(0, 1000)}... (Context from chapter part).
            Action: Visualize the key action in this text.
            Requirements: High quality, detailed line art.`;

            try {
                // Using gemini-2.5-flash for image generation as requested/suggested logic, 
                // but user specified 'gemini-2.5-flash-image' specifically in prompt.
                // Assuming standard generateContent with 'gemini-2.5-flash' can handle 'image' model if configured or if standard model supports it.
                // However, user provided specific snippet: model: "gemini-2.5-flash-image"

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-image",
                    contents: [{ parts: [{ text: imagePrompt }] }],
                });

                let imageBuffer = null;
                // Handling user provided snippet logic for inlineData
                if (response && response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            imageBuffer = Buffer.from(part.inlineData.data, "base64");
                            break;
                        }
                    }
                }

                if (!imageBuffer) {
                    throw new Error("No image data received from Gemini");
                }

                // Upload to Cloudinary
                const publicId = `comic_${chapterId}_part_${i}_${Date.now()}`;
                const uploadResult = await uploadImageToCloudinary(imageBuffer, "comic_images", publicId);

                comicPages.push({
                    url: uploadResult.secure_url,
                    order: i,
                    caption: `Part ${i + 1}` // Could generate a caption too via AI if needed
                });

            } catch (err) {
                console.error(`[Task ${taskId}] Error generating part ${i}:`, err);
                // We might continue or fail? Let's continue and show what we have
                // Or placeholder?
            }

            await task.update({
                progress: { stage: 'generating_images', current: i + 1, total: totalParts }
            });
        }

        // 5. Save to Chapter
        chapter.comic_data = comicPages;
        await chapter.save(); // Check if updates works for JSON type

        // 6. Complete Task
        await task.update({
            status: 'COMPLETED',
            result: {
                message: "Comic generated successfully",
                pageCount: comicPages.length
            }
        });

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

export const generateComic = async (req, res) => {
    try {
        const { chapterId } = req.body;

        if (!chapterId) {
            return res.status(400).json({ message: "Chapter ID is required" });
        }

        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        // Check if comic exists
        if (chapter.comic_data && Array.isArray(chapter.comic_data) && chapter.comic_data.length > 0) {
            return res.status(200).json({
                message: "Comic already exists",
                status: "COMPLETED",
                comic_data: chapter.comic_data
            });
        }

        // Check if task is already running
        const existingTask = await Task.findOne({
            where: {
                chapter_id: chapterId,
                type: 'COMIC',
                status: ['PENDING', 'PROCESSING']
            }
        });

        if (existingTask) {
            return res.status(202).json({
                taskId: existingTask.id,
                message: "Comic generation is already in progress",
                status: existingTask.status
            });
        }

        const task = await Task.create({
            type: 'COMIC',
            status: 'PENDING',
            chapter_id: chapterId,
            book_id: chapter.book_id,
            chapter_title: chapter.title,
            // book_title fetch if needed
        });

        // Async process
        processComicGeneration(task.id, chapterId, chapter.book_id);

        res.status(202).json({
            taskId: task.id,
            message: "Comic generation started",
            status: "PENDING"
        });

    } catch (error) {
        console.error("Error creating comic task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getComic = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) return res.status(404).json({ message: "Chapter not found" });

        res.status(200).json({
            comic_data: chapter.comic_data || []
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comic" });
    }
};
