import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const BookSubject = sequelize.define("book_subjects", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  book_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER },
});

export default BookSubject;
