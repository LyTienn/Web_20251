import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Chapter = sequelize.define("chapters", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  book_id: { type: DataTypes.INTEGER },
  chapter_number: { type: DataTypes.INTEGER },
  title: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT },
}, {
  freezeTableName: true,
  timestamps: false
});

export default Chapter;