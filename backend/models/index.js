// backend/models/index.js
const { sequelize } = require('../db');

const User = require('./userModel');
const Role = require('./roleModel');
const Agency = require('./agencyModel');
const Project = require('./projectModel');
const Milestone = require('./milestoneModel');
const Expenditure = require('./expenditureModel');

// -----------------------------------------------------
// ROLE ↔ USER
// -----------------------------------------------------
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });


// -----------------------------------------------------
// AGENCY ↔ PROJECT
// -----------------------------------------------------
Project.belongsTo(Agency, {
    foreignKey: 'agency_id',
    as: 'agency'
});
Agency.hasMany(Project, {
    foreignKey: 'agency_id',
    as: 'projects'
});

// -----------------------------------------------------
// USER ↔ PROJECT  (creator or owner of project)
// -----------------------------------------------------
Project.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'createdBy'
});
User.hasMany(Project, {
    foreignKey: 'created_by',
    as: 'createdProjects'
});

// -----------------------------------------------------
// PROJECT ↔ MILESTONES
// -----------------------------------------------------
Project.hasMany(Milestone, {
    foreignKey: 'project_id',
    as: 'milestones',
    onDelete: 'CASCADE'
});
Milestone.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project'
});

// -----------------------------------------------------
// USER ↔ MILESTONE (updated_by field)
// -----------------------------------------------------
Milestone.belongsTo(User, {
    foreignKey: 'updated_by',
    as: 'updatedBy'
});
User.hasMany(Milestone, {
    foreignKey: 'updated_by',
    as: 'updatedMilestones'
});

// -----------------------------------------------------


// Expenditure ↔ Project
Project.hasMany(Expenditure, {
    foreignKey: 'project_id',
    as: 'expenditures',
    onDelete: 'CASCADE'
});
Expenditure.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project'
});

// Expenditure ↔ User
User.hasMany(Expenditure, {
    foreignKey: 'created_by',
    as: 'createdExpenditures'
});
Expenditure.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'createdBy'
});

module.exports = {
    sequelize,
    User,
    Role,
    Agency,
    Project,
    Milestone,
    Expenditure
};