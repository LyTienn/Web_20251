import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Chapter = sequelize.define("chapters", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  book_id: { type: DataTypes.INTEGER },
  chapter_number: { type: DataTypes.INTEGER },
  title: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT },
  audio_links: { type: DataTypes.JSON, defaultValue: [] },
  summary: { type: DataTypes.TEXT },
  comic_data: { type: DataTypes.JSON, defaultValue: [] }, // Stores [{ url, caption, order }]
}, {
  freezeTableName: true,
  timestamps: false
});

export default Chapter;