import Chapter from "../models/chapter-model.js";
import Book from "../models/book-model.js";

// Get chapter details by ID
export const getChapterById = async (req, res) => {
    try {
        const { id } = req.params;
        const chapter = await Chapter.findByPk(id);

        if (!chapter) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chương" });
        }

        res.json({ success: true, data: chapter });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết chương", error: error.message });
    }
};

// Update chapter
export const updateChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, chapter_number } = req.body;

        const chapter = await Chapter.findByPk(id);
        if (!chapter) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chương" });
        }

        await chapter.update({
            title,
            content,
            chapter_number
        });

        res.json({ success: true, data: chapter, message: "Cập nhật chương thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật chương", error: error.message });
    }
};

// Delete chapter
export const deleteChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const chapter = await Chapter.findByPk(id);

        if (!chapter) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chương" });
        }

        await chapter.destroy();
        res.json({ success: true, message: "Xóa chương thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa chương", error: error.message });
    }
};

// Create a single chapter (Manual addition)
export const createChapter = async (req, res) => {
    try {
        const { book_id, title, content, chapter_number } = req.body;

        if (!book_id || !title) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc (Book ID, Title)" });
        }

        const book = await Book.findByPk(book_id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Sách không tồn tại" });
        }

        const chapter = await Chapter.create({
            book_id,
            title,
            content,
            chapter_number: chapter_number || 0 // Default or auto-increment logic could ideally be here but manual input is safer
        });

        res.status(201).json({ success: true, data: chapter, message: "Tạo chương thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo chương", error: error.message });
    }
};
