import GeminiClient from "../utils/GeminiClient.js";
import Chapter from "../models/chapter-model.js";
import Book from "../models/book-model.js";
import { Task } from "../models/index.js";
import { splitTextByLimit } from "../utils/text-splitter.js";


const processSummary = async (taskId, text, chapterId) => {
    try {
        const task = await Task.findByPk(taskId);
        if (!task) return;

        await task.update({ status: 'PROCESSING' });

        let language = "Vietnamese"; // Default
        let textToSummarize = text;

        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId);
            if (chapter) {
                // Check Cache
                if (chapter.summary) {
                    await task.update({
                        status: 'COMPLETED',
                        result: {
                            summary: chapter.summary,
                            message: "Retrieved from cache"
                        }
                    });
                    return;
                }

                if (chapter.book_id) {
                    const book = await Book.findByPk(chapter.book_id);
                    if (book && book.language) {
                        language = book.language;
                    }
                }
                if (!text) {
                    textToSummarize = chapter.content;
                }
            }
        }

        if (!textToSummarize) {
            throw new Error("Content is required for summarization");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Server configuration error: API Key missing");
        }

        // Generate Summary (Rolling Context)
        const client = new GeminiClient(apiKey);
        const chunks = splitTextByLimit(textToSummarize, 50000); // 50k chars per chunk
        console.log(`[Task ${taskId}] Splitting text into ${chunks.length} chunks for summarization.`);

        let fullSummary = "";
        let previousSummary = "";

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`[Task ${taskId}] Summarizing chunk ${i + 1}/${chunks.length}...`);

            let prompt = `Summarize the following book chapter section in a concise manner (${language}).`;
            if (previousSummary) {
                prompt += `\n\nContext from previous section: ${previousSummary}`;
            }
            prompt += `\n\nText to summarize:\n${chunk}`;

            const chunkSummary = await client.generateContent(prompt);

            if (chunkSummary) {
                fullSummary += (fullSummary ? "\n\n" : "") + chunkSummary;
                previousSummary = chunkSummary; // Update context for next chunk
            }
        }

        if (fullSummary) {
            // Update Database if chapterId exists
            if (chapterId) {
                await Chapter.update({ summary: fullSummary }, { where: { id: chapterId } });
            }

            // Update Task
            await task.update({
                status: 'COMPLETED',
                result: {
                    summary: fullSummary,
                    message: "Summary generated and saved"
                }
            });
            console.log(`[Task ${taskId}] Completed successfully.`);
        } else {
            throw new Error("Failed to generate summary: Empty response");
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

export const summarizeChapter = async (req, res) => {
    try {
        const { text, chapterId } = req.body;

        // Fetch context information
        let bookTitle = null;
        let chapterTitle = null;
        let bookId = null;

        if (chapterId) {
            const chapter = await Chapter.findByPk(chapterId, {
                include: [{ association: 'book', attributes: ['id', 'title'] }]
            });
            if (chapter) {
                // Check if summary already exists
                if (chapter.summary) {
                    return res.status(200).json({
                        summary: chapter.summary,
                        message: "Retrieved from cache",
                        status: "COMPLETED"
                    });
                }

                chapterTitle = chapter.title;
                if (chapter.book) {
                    bookId = chapter.book.id;
                    bookTitle = chapter.book.title;
                }
            }
        }

        // Check for existing pending/processing task to avoid duplicates
        const existingTask = await Task.findOne({
            where: {
                chapter_id: chapterId,
                type: 'SUMMARY',
                status: ['PENDING', 'PROCESSING']
            }
        });

        if (existingTask) {
            return res.status(202).json({
                taskId: existingTask.id,
                message: "Summary generation is already in progress",
                status: existingTask.status
            });
        }

        const task = await Task.create({
            type: 'SUMMARY',
            status: 'PENDING',
            chapter_id: chapterId || null,
            book_id: bookId,
            book_title: bookTitle,
            chapter_title: chapterTitle,
        });

        // Respond immediately
        res.status(202).json({
            taskId: task.id,
            message: "Summary generation started",
            status: "PENDING"
        });

        // Background process
        processSummary(task.id, text, chapterId);

    } catch (error) {
        console.error("Error initiating summary task:", error);
        res.status(500).json({ message: "Failed to initiate summary task", error: error.message });
    }
};
