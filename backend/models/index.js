// backend/models/index.js
const { sequelize } = require('../db');

const User = require('./userModel');
const Role = require('./roleModel');

// Define associations here (single place)
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

module.exports = {
    sequelize,
    User,
    Role,
};
