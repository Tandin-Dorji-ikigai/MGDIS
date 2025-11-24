const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const RoleModel = sequelize.define('Role', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'roles',
    timestamps: false,
});

module.exports = RoleModel;
