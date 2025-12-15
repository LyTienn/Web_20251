import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Comment = sequelize.define(
  "Comment",
  {
    comment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "comment_id",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "book_id",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "comments",
    timestamps: false,
    underscored: true,
  }
);

export default Comment;
