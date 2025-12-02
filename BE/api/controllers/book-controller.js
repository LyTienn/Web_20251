import Book from "../models/book-model.js";
import Subject from "../models/subject-model.js";
import Author from "../models/author-model.js";
import BookSubject from "../models/book_subject-model.js";

// Thiết lập association nếu chưa có
if (!Book.associations.Author) {
  Book.belongsTo(Author, { foreignKey: "author_id" });
}
if (!Book.associations.Subjects) {
  Book.belongsToMany(Subject, { through: BookSubject, foreignKey: "book_id", otherKey: "subject_id" });
}

// Lấy toàn bộ sách
export const getAllBooks = async (req, res) => {
  try {
    const { subjectId, authorId } = req.query;
    let where = {};

    if (authorId) {
      where.author_id = authorId;
    }

    let include = [
      {
        model: Author,
        attributes: ["name"],
      },
      {
        model: Subject,
        attributes: ["name"],
        through: { attributes: [] },
      },
    ];

    if (subjectId) {
      // Tìm các book_id thuộc subjectId
      const bookSubjects = await BookSubject.findAll({ where: { subject_id: subjectId } });
      const bookIds = bookSubjects.map(bs => bs.book_id);
      if (bookIds.length === 0) {
        return res.json({ success: true, data: [] });
      }
      where.id = bookIds;
    }

    const books = await Book.findAll({ where, include });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách", error: error.message });
  }
};

// Lấy chi tiết một sách theo id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        {
          model: Author,
          attributes: ["name"],
        },
        {
          model: Subject,
          attributes: ["name"],
          through: { attributes: [] },
        },
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
    const { title, author_id, description, published_year } = req.body;
    if (!title || !author_id) {
      return res.status(400).json({ success: false, message: "Thiếu tiêu đề hoặc tác giả" });
    }
    const book = await Book.create({ title, author_id, description, published_year });
    // Lấy lại sách vừa tạo kèm tác giả và chủ đề
    const bookWithDetails = await Book.findByPk(book.id, {
      include: [
        { model: Author, attributes: ["name"] },
        { model: Subject, attributes: ["name"], through: { attributes: [] } },
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
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, attributes: ["name"] },
        { model: Subject, attributes: ["name"], through: { attributes: [] } },
      ],
    });
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }
    await book.destroy();
    res.json({ success: true, message: "Xóa sách thành công", data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa sách", error: error.message });
  }
};
