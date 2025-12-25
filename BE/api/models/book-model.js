import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Book = sequelize.define("books", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gutenberg_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.TEXT },
  author_id: { type: DataTypes.INTEGER },
  language: { type: DataTypes.STRING(10) },
  download_count: { type: DataTypes.INTEGER },
  summary: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.TEXT },
  txt_url: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE },
  type: { type: DataTypes.ENUM('FREE', 'PREMIUM'), allowNull: false, defaultValue: 'FREE' },
  is_deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: false
});


export default Book;
