const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Agency = sequelize.define('Agency', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'agencies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Agency;
