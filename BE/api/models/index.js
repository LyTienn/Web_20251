import sequelize from "../config/db-config.js";

// Import Sequelize model instances (named exports)
import { User } from "./user-model.js";
import Book from "./book-model.js";
import Author from "./author-model.js";
import Subject from "./subject-model.js";
import BookSubject from "./book_subject-model.js";
import Comment from "./comment-model.js";
import UserBookshelf from "./user-bookshelf-model.js";
import Chapter from "./chapter-model.js";
import Bookshelf from "./bookshelf-model.js";
import BookBookshelf from "./book_bookshelf-model.js";

// Định nghĩa tất cả associations tại ĐÂY
const setupAssociations = () => {
  // Book - Author (Many to One)
  Book.belongsTo(Author, { foreignKey: "author_id", as: "author" });
  Author.hasMany(Book, { foreignKey: "author_id", as: "books" });

  // Book - Subject (Many to Many)
  Book.belongsToMany(Subject, {
    through: BookSubject,
    foreignKey: "book_id",
    otherKey: "subject_id",
    as: "subjects",
  });
  Subject.belongsToMany(Book, {
    through: BookSubject,
    foreignKey: "subject_id",
    otherKey: "book_id",
    as: "books",
  });

  // Book - Bookshelf (Many to Many)
  Book.belongsToMany(Bookshelf, {
    through: BookBookshelf,
    foreignKey: "book_id",
    otherKey: "bookshelf_id",
    as: "bookshelves",
  });
  Bookshelf.belongsToMany(Book, {
    through: BookBookshelf,
    foreignKey: "bookshelf_id",
    otherKey: "book_id",
    as: "books",
  });

  // User - Comment - Book
  User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
  Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Book.hasMany(Comment, { foreignKey: "book_id", as: "comments" });
  Comment.belongsTo(Book, { foreignKey: "book_id", as: "book" });

  // User - UserBookshelf - Book
  User.belongsToMany(Book, {
    through: UserBookshelf,
    foreignKey: "user_id",
    otherKey: "book_id",
    as: "bookshelf",
  });

  Book.belongsToMany(User, {
    through: UserBookshelf,
    foreignKey: "book_id",
    otherKey: "user_id",
    as: "users",
  });

  User.hasMany(UserBookshelf, { foreignKey: "user_id", as: "bookshelfItems" });
  UserBookshelf.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Book.hasMany(UserBookshelf, { foreignKey: "book_id", as: "bookshelfItems" });
  UserBookshelf.belongsTo(Book, { foreignKey: "book_id", as: "book" });

  // Book - Chapter
  Book.hasMany(Chapter, { foreignKey: "book_id", as: "chapters" });
  Chapter.belongsTo(Book, { foreignKey: "book_id", as: "book" });
};

// Gọi setup associations
setupAssociations();

// Export tất cả models
export {
  sequelize,
  User,
  Book,
  Author,
  Subject,
  BookSubject,
  Comment,
  UserBookshelf,
  Chapter,
  Bookshelf,
  BookBookshelf,
};

export default {
  sequelize,
  User,
  Book,
  Author,
  Subject,
  BookSubject,
  Comment,
  UserBookshelf,
  Chapter,
  Bookshelf,
  BookBookshelf,
};
