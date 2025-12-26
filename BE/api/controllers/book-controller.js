import Book from "../models/book-model.js";
import Subject from "../models/subject-model.js";
import Author from "../models/author-model.js";
import BookSubject from "../models/book_subject-model.js";
import BookShelf from "../models/bookshelf-model.js";
import BookBookshelf from "../models/book_bookshelf-model.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

// Thiết lập association nếu chưa có
if (!Book.associations.Author) {
  Book.belongsTo(Author, { foreignKey: "author_id" });
}
if (!Book.associations.Subjects) {
  Book.belongsToMany(Subject, { through: BookSubject, foreignKey: "book_id", otherKey: "subject_id" });
}
if (!Book.associations.bookshelves) {
  Book.belongsToMany(BookShelf, {
    through: BookBookshelf,
    foreignKey: "book_id",
    otherKey: "bookshelf_id",
    as: "bookshelves"
  });
}



// Lấy toàn bộ sách (có phân trang)
export const getAllBooks = async (req, res) => {
  try {
    const { subjectId, authorId, page = 1, limit = 10, keyword, q, type } = req.query;
    let where = { is_deleted: 0 }; // Soft filter
    const offset = (page - 1) * limit;

    const searchTerm = keyword || q;

    if (authorId) {
      where.author_id = authorId;
    }

    if (type) {
      where.type = type;
    }

    if (searchTerm) {
      // Tìm các author_id có tên khớp với từ khóa
      const authors = await Author.findAll({
        where: {
          name: { [Op.iLike]: `%${searchTerm}%` }
        },
        attributes: ['id']
      });
      const matchedAuthorIds = authors.map(a => a.id);

      where = {
        ...where,
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { author_id: { [Op.in]: matchedAuthorIds } }
        ]
      };
    }

    let include = [
      {
        model: Author,
        as: "author",
        attributes: ["name"],
      },
      {
        model: Subject,
        as: "subjects",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
      {
        model: BookShelf,
        attributes: ["id", "name"],
        through: { attributes: [] },
        as: "bookshelves"
      }
    ];

    if (subjectId) {
      // Tìm các book_id thuộc subjectId
      const bookSubjects = await BookSubject.findAll({ where: { subject_id: subjectId } });
      const bookIds = bookSubjects.map(bs => bs.book_id);
      if (bookIds.length === 0) {
        return res.json({
          success: true,
          data: {
            total: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            books: []
          }
        });
      }
      where.id = bookIds;
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      include,
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM chapters WHERE chapters.book_id = books.id)'), 'chapter_count']
        ]
      },
      limit: parseInt(limit),
      // logging: console.log,
      offset: parseInt(offset),
      distinct: true, // Important for include to count correctly
      order: [['created_at', 'DESC']] // Default sort
    });

    res.json({
      success: true,
      data: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        books: rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách", error: error.message });
  }
};

// Lấy chi tiết một sách theo id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, is_deleted: 0 },
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM chapters WHERE chapters.book_id = books.id)'), 'chapter_count']
        ]
      },
      include: [
        {
          model: Author,
          attributes: ["name"],
        },
        {
          model: Subject,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          model: BookShelf,
          attributes: ["id", "name"],
          through: { attributes: [] },
          as: "bookshelves"
        }
      ],
    });
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết sách", error: error.message });
  }
};

// Lấy danh sách chương của một sách

import Chapter from "../models/chapter-model.js";
export const getBookChapters = async (req, res) => {
  try {
    const chapters = await Chapter.findAll({ where: { book_id: req.params.id } });
    res.json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách chương", error: error.message });
  }
};

// Lấy toàn bộ subject
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách chủ đề", error: error.message });
  }
};

// Lấy chi tiết subject theo id
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chủ đề" });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết chủ đề", error: error.message });
  }
};

// Lấy danh sách sách theo subject
export const getBooksBySubject = async (req, res) => {
  try {
    const bookSubjects = await BookSubject.findAll({ where: { subject_id: req.params.id } });
    const bookIds = bookSubjects.map(bs => bs.book_id);
    const books = await Book.findAll({ where: { id: bookIds } });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách theo chủ đề", error: error.message });
  }
};

// Lấy toàn bộ author
export const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: authors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách tác giả", error: error.message });
  }
};

// Lấy chi tiết author theo id
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

// Lấy danh sách sách của một author
export const getBooksByAuthor = async (req, res) => {
  try {
    const books = await Book.findAll({ where: { author_id: req.params.id } });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách của tác giả", error: error.message });
  }
};

// Tạo sách mới
export const createBook = async (req, res) => {
  try {
    const { title, author_id, summary, published_year, type, language, page_count, image_url, subjectIds } = req.body;
    if (!title || !author_id) {
      return res.status(400).json({ success: false, message: "Thiếu tiêu đề hoặc tác giả" });
    }
    const book = await Book.create({
      title,
      author_id,
      summary,
      published_year,
      type: type || 'FREE',
      language,
      page_count,
      image_url
    });

    // Add subjects if provided
    if (subjectIds && Array.isArray(subjectIds)) {
      await book.setSubjects(subjectIds);
    }

    // Lấy lại sách vừa tạo kèm tác giả và chủ đề
    const bookWithDetails = await Book.findByPk(book.id, {
      include: [
        { model: Author, as: "author", attributes: ["name"] },
        { model: Subject, as: "subjects", attributes: ["id", "name"], through: { attributes: [] } },
      ],
    });
    res.status(201).json({ success: true, data: bookWithDetails, message: "Tạo sách thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo sách", error: error.message });
  }
};

// Xóa sách
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }
    // Soft Delete
    await book.update({ is_deleted: 1 });

    // Note: Associations (BookSubject) can be kept or soft deleted too. 
    // Usually keep them to allow restore, unless hard cleanup is needed.
    // await BookSubject.destroy({ where: { book_id: req.params.id } }); // Commented out to preserve relations for restore

    res.json({ success: true, message: "Xóa sách thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa sách", error: error.message });
  }
};

// Cập nhật sách
export const updateBook = async (req, res) => {
  try {
    const { title, author_id, summary, image_url, type, language, page_count, published_year, subjectIds } = req.body;
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }
    await book.update({
      title,
      author_id,
      summary,
      image_url,
      type,
      language,
      page_count,
      published_year
    });

    // Update subjects if provided
    if (subjectIds && Array.isArray(subjectIds)) {
      await book.setSubjects(subjectIds);
    }

    const bookWithDetails = await Book.findByPk(book.id, {
      include: [
        { model: Author, as: "author", attributes: ["name"] },
        { model: Subject, as: "subjects", attributes: ["id", "name"], through: { attributes: [] } },
      ],
    });
    res.json({ success: true, data: bookWithDetails, message: "Cập nhật sách thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật sách", error: error.message });
  }
};
