import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";


const Author = sequelize.define("authors", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
}, {
  timestamps: false
});

export default Author;
