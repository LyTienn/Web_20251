import Author from "../models/author-model.js";
import Book from "../models/book-model.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

// Lấy toàn bộ tác giả (có phân trang)
export const getAllAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, sort, order } = req.query;
    const offset = (page - 1) * limit;

    let where = { is_deleted: 0 }; // Soft delete filter
    if (q) {
      where.name = { [Op.iLike]: `%${q}%` };
    }

    let orderClause = [['name', 'ASC']];
    if (sort === 'books_count') {
      orderClause = [[sequelize.literal('books_count'), order === 'ASC' ? 'ASC' : 'DESC']];
    } else if (sort === 'birth_year') {
      orderClause = [['birth_year', order === 'DESC' ? 'DESC' : 'ASC']];
    } else if (sort === 'name') {
      orderClause = [['name', order === 'DESC' ? 'DESC' : 'ASC']];
    }

    const { count, rows } = await Author.findAndCountAll({
      where,
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM books WHERE books.author_id = "authors"."id" AND books.is_deleted = 0)'), 'books_count']
        ]
      },
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        authors: rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách tác giả", error: error.message });
  }
};

// Lấy chi tiết một tác giả theo id
export const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findOne({ where: { id: req.params.id, is_deleted: 0 } });
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
    const books = await Book.findAll({ where: { author_id: req.params.id, is_deleted: 0 } });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách của tác giả", error: error.message });
  }
};

// Tạo tác giả mới
export const createAuthor = async (req, res) => {
  try {
    let { name, birth_year, death_year } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên tác giả không được để trống" });
    }

    // Validate and format input
    birth_year = birth_year ? parseInt(birth_year) : null;
    death_year = death_year ? parseInt(death_year) : null;

    const author = await Author.create({ name, birth_year, death_year });
    res.status(201).json({ success: true, data: author, message: "Tạo tác giả thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo tác giả", error: error.message });
  }
};

// Cập nhật tác giả
export const updateAuthor = async (req, res) => {
  try {
    let { name, birth_year, death_year } = req.body;
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tác giả" });
    }

    birth_year = birth_year ? parseInt(birth_year) : null;
    death_year = death_year ? parseInt(death_year) : null;

    await author.update({ name, birth_year, death_year });
    res.json({ success: true, data: author, message: "Cập nhật tác giả thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật tác giả", error: error.message });
  }
};

// Xóa tác giả
export const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!author) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tác giả" });
    }
    // Kiểm tra xem có sách nào của tác giả này không (vẫn active)
    const bookCount = await Book.count({ where: { author_id: req.params.id, is_deleted: 0 } });
    if (bookCount > 0) {
      return res.status(400).json({ success: false, message: `Không thể xóa tác giả vì còn ${bookCount} sách liên quan` });
    }

    // Soft Delete
    await author.update({ is_deleted: 1 });

    res.json({ success: true, message: "Xóa tác giả thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa tác giả", error: error.message });
  }
};
