import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";


const Subject = sequelize.define("subjects", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
}, {
  timestamps: false
});

export default Subject;
