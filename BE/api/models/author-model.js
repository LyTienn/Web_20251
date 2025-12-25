import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";


const Author = sequelize.define("authors", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  birth_year: { type: DataTypes.INTEGER },
  death_year: { type: DataTypes.INTEGER },
  is_deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: false
});

export default Author;
