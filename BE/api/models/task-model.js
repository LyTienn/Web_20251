import { DataTypes } from 'sequelize';
import sequelize from '../config/db-config.js';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('TTS', 'SUMMARY', 'TRANSLATION', 'COMIC'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
        defaultValue: 'PENDING',
        allowNull: false,
    },
    result: {
        type: DataTypes.JSON, // Stores audioUrl or summary text
        allowNull: true,
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    progress: {
        type: DataTypes.JSON, // { current: 1, total: 10, stage: 'processing' | 'uploading' }
        allowNull: true,
    },
    chapter_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    book_title: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    chapter_title: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    voice_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'tasks',
    timestamps: true, // createdAt, updatedAt
});

export default Task;
