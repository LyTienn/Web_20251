import { DataTypes } from "sequelize";
import sequelize from "../config/db-config.js";

const Translation = sequelize.define(
    "Translation",
    {
        translation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "translation_id",
        },
        chapter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "chapter_id",
        },
        language: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: "language",
        },
        translated_text: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "translated_text",
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
    },
    {
        tableName: "translations",
        timestamps: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["chapter_id", "language"],
            },
        ],
    }
);

export default Translation;
