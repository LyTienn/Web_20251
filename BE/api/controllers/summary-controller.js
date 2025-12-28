import { GoogleGenAI } from "@google/genai";
import Chapter from "../models/chapter-model.js";
import Book from "../models/book-model.js";

export const summarizeChapter = async (req, res) => {
    try {
        const { text, chapterId } = req.body;
        let language = "Vietnamese"; // Default

        // 1. Check if chapterId is provided
        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            if (!chapter) {
                return res.status(404).json({ message: "Chapter not found" });
            }

            // 2. Check cache in database
            if (chapter.summary) {
                return res.status(200).json({
                    summary: chapter.summary,
                    message: "Retrieved from cache"
                });
            }

            // Fetch Book for Language
            if (chapter.book_id) {
                const book = await Book.findByPk(chapter.book_id);
                if (book && book.language) {
                    language = book.language;
                }
            }
        }

        // 3. Determine text source
        const textToSummarize = text || (chapterId ? (await Chapter.findByPk(chapterId))?.content : null);

        if (!textToSummarize) {
            return res.status(400).json({ message: "Content is required for summarization" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not configured");
            return res.status(500).json({ message: "Server configuration error: API Key missing" });
        }

        // 4. Generate Summary
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Summarize the following book chapter in a concise manner (${language}):\n\n${textToSummarize}`,
        });

        if (response) {
            let summaryText = "";
            if (typeof response.text === 'function') {
                summaryText = response.text();
            } else if (response.text) {
                summaryText = response.text;
            } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
                summaryText = response.candidates[0].content.parts[0].text;
            }

            if (summaryText) {
                // 5. Update Database if chapterId exists
                if (chapterId) {
                    await Chapter.update({ summary: summaryText }, { where: { id: chapterId } });
                }

                res.status(200).json({ summary: summaryText, message: "Summary generated and saved" });
            } else {
                res.status(500).json({ message: "Failed to generate summary: Empty response" });
            }
        } else {
            res.status(500).json({ message: "Failed to generate summary: No response" });
        }

    } catch (error) {
        console.error("Error summarizing chapter:", error);
        res.status(500).json({ message: "Failed to summarize chapter", error: error.message });
    }
};
