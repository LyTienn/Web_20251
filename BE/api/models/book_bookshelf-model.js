import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const BookBookshelf = sequelize.define("book_bookshelves", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  book_id: { type: DataTypes.INTEGER },
  bookshelf_id: { type: DataTypes.INTEGER },
});

export default BookBookshelf;
