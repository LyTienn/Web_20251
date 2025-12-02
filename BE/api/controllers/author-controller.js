import Author from "../models/author-model.js";
import Book from "../models/book-model.js";

// Lấy toàn bộ tác giả
export const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: authors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách tác giả", error: error.message });
  }
};

// Lấy chi tiết một tác giả theo id
export const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tác giả" });
    }
    res.json({ success: true, data: author });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết tác giả", error: error.message });
  }
};

// Lấy danh sách sách của một tác giả
export const getBooksByAuthor = async (req, res) => {
  try {
    const books = await Book.findAll({ where: { author_id: req.params.id } });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách của tác giả", error: error.message });
  }
};

// Tạo tác giả mới
export const createAuthor = async (req, res) => {
  try {
    const { name, birth_year, death_year } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên tác giả không được để trống" });
    }
    const author = await Author.create({ name, birth_year, death_year });
    res.status(201).json({ success: true, data: author, message: "Tạo tác giả thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo tác giả", error: error.message });
  }
};

// Cập nhật tác giả
export const updateAuthor = async (req, res) => {
  try {
    const { name, birth_year, death_year } = req.body;
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tác giả" });
    }
    await author.update({ name, birth_year, death_year });
    res.json({ success: true, data: author, message: "Cập nhật tác giả thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật tác giả", error: error.message });
  }
};

// Xóa tác giả
export const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tác giả" });
    }
    // Kiểm tra xem có sách nào của tác giả này không
    const bookCount = await Book.count({ where: { author_id: req.params.id } });
    if (bookCount > 0) {
      return res.status(400).json({ success: false, message: `Không thể xóa tác giả vì còn ${bookCount} sách liên quan` });
    }
    await author.destroy();
    res.json({ success: true, message: "Xóa tác giả thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa tác giả", error: error.message });
  }
};
