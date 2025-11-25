const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Milestone = sequelize.define('Milestone', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },

    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    target_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    actual_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },

    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'delayed'),
        defaultValue: 'pending',
    },

    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        }
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'milestones',
    timestamps: false,
});

module.exports = Milestone;
