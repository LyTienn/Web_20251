import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const UserBookshelf = sequelize.define(
  "UserBookshelf",
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      field: "user_id",
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "book_id",
    },
    status: {
      type: DataTypes.ENUM("FAVORITE", "READING"),
      allowNull: false,
      primaryKey: true,
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "added_at",
    },
    last_read_chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Có thể null nếu mới thêm vào tủ mà chưa đọc
      field: "last_read_chapter_id"
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_read_at"
    },
    last_read_scroll_position: {
      type: DataTypes.FLOAT, // Hoặc DECIMAL
      allowNull: true,
      defaultValue: 0,
    }
  },
  {
    tableName: "user_bookshelf",
    timestamps: false,
    underscored: true,
  }
);

export default UserBookshelf;
