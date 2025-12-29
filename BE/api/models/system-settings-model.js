import { DataTypes } from 'sequelize';
import sequelize from '../config/db-config.js';

const SystemSettings = sequelize.define('SystemSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'system_settings',
    timestamps: false
});

export default SystemSettings;
