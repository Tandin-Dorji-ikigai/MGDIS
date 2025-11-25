const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Expenditure = sequelize.define('Expenditure', {
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

    amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    spend_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }

}, {
    tableName: 'expenditures',
    timestamps: false,
    indexes: [
        {
            name: 'idx_expenditures_project',
            fields: ['project_id']
        }
    ]
});

module.exports = Expenditure;
