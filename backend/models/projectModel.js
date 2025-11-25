const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Project = sequelize.define('Project',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        agency_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'agencies',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        budget_total: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: true,
            validate: {
                min: 0,
            },
        },

        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM(
                'not_started',
                'in_progress',
                'delayed',
                'completed',
                'cancelled'
            ),
            defaultValue: 'not_started',
        },

        is_public: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'projects',
        timestamps: false,
    }
);

module.exports = Project;
