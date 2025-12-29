import GeminiClient from "../utils/GeminiClient.js";
import Chapter from "../models/chapter-model.js";
import Book from "../models/book-model.js";
import Translation from "../models/translation-model.js";
import { Task } from "../models/index.js";
import { splitTextByLimit } from "../utils/text-splitter.js";

const processTranslation = async (taskId, text, chapterId, targetLanguage) => {
    try {
        const task = await Task.findByPk(taskId);
        if (!task) return;

        await task.update({ status: 'PROCESSING' });

        // 1. Check Cache (Double check in case of race condition)
        if (chapterId) {
            const existingTranslation = await Translation.findOne({
                where: { chapter_id: chapterId, language: targetLanguage }
            });

            if (existingTranslation) {
                await task.update({
                    status: 'COMPLETED',
                    result: {
                        translation: existingTranslation.translated_text,
                        language: targetLanguage,
                        message: "Retrieved from cache"
                    }
                });
                return;
            }
        }

        const textToTranslate = text;
        if (!textToTranslate) {
            throw new Error("Content is required for translation");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Server configuration error: API Key missing");
        }

        const client = new GeminiClient(apiKey);

        // Split text into chunks (~5000 chars to be safe for translation context)
        const chunks = splitTextByLimit(textToTranslate, 5000);
        console.log(`[Task ${taskId}] Splitting text into ${chunks.length} chunks for translation to ${targetLanguage}.`);

        let fullTranslation = "";

        await task.update({
            progress: { current: 0, total: chunks.length, stage: 'translating' }
        });

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`[Task ${taskId}] Translating chunk ${i + 1}/${chunks.length}...`);

            const prompt = `Translate the following book chapter section into ${targetLanguage}. Maintain the original tone and formatting. Do not add any explanatory text, just the translation.\n\nText to translate:\n${chunk}`;

            try {
                const chunkTranslation = await client.generateContent(prompt);

                if (chunkTranslation) {
                    fullTranslation += (fullTranslation ? "\n\n" : "") + chunkTranslation;
                }
            } catch (chunkError) {
                console.error(`[Task ${taskId}] Error translating chunk ${i + 1}:`, chunkError);
                throw chunkError; // Fail the whole task if a chunk fails
            }

            // Update progress
            await task.update({
                progress: { current: i + 1, total: chunks.length, stage: 'translating' }
            });
        }

        if (fullTranslation) {
            // Save to Database
            if (chapterId) {
                await Translation.create({
                    chapter_id: chapterId,
                    language: targetLanguage,
                    translated_text: fullTranslation
                });
            }

            // Update Task
            await task.update({
                status: 'COMPLETED',
                progress: { current: chunks.length, total: chunks.length, stage: 'completed' },
                result: {
                    translation: fullTranslation,
                    language: targetLanguage,
                    message: "Translation generated and saved"
                }
            });
            console.log(`[Task ${taskId}] Completed successfully.`);
        } else {
            throw new Error("Failed to generate translation: Empty response");
        }

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

export const translateChapter = async (req, res) => {
    try {
        const { text, chapterId, targetLanguage = 'Vietnamese' } = req.body;

        if (!chapterId && !text) {
            return res.status(400).json({ message: "Chapter ID or Text is required" });
        }

        // Fetch context information
        let bookTitle = null;
        let chapterTitle = null;
        let bookId = null;
        let textToUse = text;

        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId, {
                include: [{ association: 'book', attributes: ['id', 'title'] }]
            });
            if (chapter) {
                chapterTitle = chapter.title;
                if (!textToUse) textToUse = chapter.content; // Use DB content if not provided

                // Check cache FIRST
                const cached = await Translation.findOne({
                    where: { chapter_id: chapterId, language: targetLanguage }
                });

                if (cached) {
                    return res.status(200).json({
                        status: 'COMPLETED',
                        result: {
                            translation: cached.translated_text,
                            language: targetLanguage,
                            message: "Retrieved from cache"
                        }
                    });
                }

                if (chapter.book) {
                    bookId = chapter.book.id;
                    bookTitle = chapter.book.title;
                }
            } else if (!textToUse) {
                return res.status(404).json({ message: "Chapter not found" });
            }
        }

        const task = await Task.create({
            type: 'TRANSLATION', // You might need to add this to Task ENUM if strict, otherwise string is fine
            status: 'PENDING',
            chapter_id: chapterId || null,
            book_id: bookId,
            book_title: bookTitle,
            chapter_title: chapterTitle,
        });

        // Respond immediately
        res.status(202).json({
            taskId: task.id,
            message: "Translation task started",
            status: "PENDING"
        });

        // Background process
        processTranslation(task.id, textToUse, chapterId, targetLanguage);

    } catch (error) {
        console.error("Error initiating translation task:", error);
        res.status(500).json({ message: "Failed to initiate translation task", error: error.message });
    }
};

export const getTranslation = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { language } = req.query;

        if (!chapterId || !language) {
            return res.status(400).json({ message: "Chapter ID and Language are required" });
        }

        const translation = await Translation.findOne({
            where: { chapter_id: chapterId, language: language }
        });

        if (!translation) {
            return res.status(404).json({ message: "Translation not found" });
        }

        res.status(200).json({
            success: true,
            data: translation
        });

    } catch (error) {
        console.error("Error fetching translation:", error);
        res.status(500).json({ message: "Server error" });
    }
};
