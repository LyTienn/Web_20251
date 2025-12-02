import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Bookshelf = sequelize.define("bookshelves", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
});

export default Bookshelf;
