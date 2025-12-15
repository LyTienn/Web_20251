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
  },
  {
    tableName: "user_bookshelf",
    timestamps: false,
    underscored: true,
  }
);

export default UserBookshelf;
