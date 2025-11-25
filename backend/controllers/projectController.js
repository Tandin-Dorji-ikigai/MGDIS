const { Op, fn, col } = require('sequelize');
const Project = require('../models/projectModel');
const Agency = require('../models/agencyModel');
const Milestone = require('../models/milestoneModel');
const User = require('../models/userModel');
const Expenditure = require('../models/expenditureModel');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const {
            agency_id,
            name,
            description,
            category,
            budget_total,
            start_date,
            end_date,
            status,
            is_public,
        } = req.body;

        const project = await Project.create({
            agency_id,
            name,
            description,
            category,
            budget_total,
            start_date,
            end_date,
            status,
            is_public,
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project,
        });
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message,
        });
    }
};

// Get all projects (with filters + pagination)
exports.getProjects = async (req, res) => {
    try {
        const {
            status,
            agency_id,
            is_public,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const where = {};

        if (status) where.status = status;
        if (agency_id) where.agency_id = agency_id;
        if (is_public !== undefined) where.is_public = is_public === 'true';

        if (search) {
            where.name = {
                [Op.iLike]: `%${search}%`,
            };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await Project.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: limitNum,
            offset,
            include: [
                {
                    model: Agency,
                    as: 'agency',
                    attributes: ['id', 'name', 'description'],
                },
            ],
        });


        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message,
        });
    }
};

// Public projects only (for portal)
exports.getPublicProjects = async (req, res) => {
    try {
        const {
            status,
            agency_id,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const where = { is_public: true };

        if (status) where.status = status;
        if (agency_id) where.agency_id = agency_id;

        if (search) {
            where.name = {
                [Op.iLike]: `%${search}%`,
            };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await Project.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: limitNum,
            offset,
            include: [
                {
                    model: Agency,
                    as: 'agency',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Milestone,
                    as: 'milestones',
                    include: [
                        {
                            model: User,
                            as: 'updatedBy',
                            attributes: ['id', 'username', 'email']
                        }
                    ],
                    order: [['target_date', 'ASC']]
                }
            ],
        });


        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching public projects:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch public projects',
            error: error.message,
        });
    }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id, {
            include: [
                {
                    model: Agency,
                    as: 'agency',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Milestone,
                    as: 'milestones',
                    include: [
                        {
                            model: User,
                            as: 'updatedBy',
                            attributes: ['id', 'username', 'email']
                        }
                    ],
                    order: [['target_date', 'ASC']]
                }
            ]
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message,
        });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        const {
            agency_id,
            name,
            description,
            category,
            budget_total,
            start_date,
            end_date,
            status,
            is_public,
        } = req.body;

        await project.update({
            agency_id: agency_id ?? project.agency_id,
            name: name ?? project.name,
            description: description ?? project.description,
            category: category ?? project.category,
            budget_total: budget_total ?? project.budget_total,
            start_date: start_date ?? project.start_date,
            end_date: end_date ?? project.end_date,
            status: status ?? project.status,
            is_public:
                typeof is_public === 'boolean' ? is_public : project.is_public,
            updated_at: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project,
        });
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message,
        });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        await project.destroy();

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message,
        });
    }
};


exports.getProjectFinancials = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Make sure project exists
        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // 2. Aggregate total spent from expenditures
        const sumRow = await Expenditure.findOne({
            attributes: [
                [fn('COALESCE', fn('SUM', col('amount')), 0), 'total_spent'],
            ],
            where: { project_id: id },
            raw: true,
        });

        const budgetTotal = Number(project.budget_total || 0);
        const spentTotal = Number(sumRow?.total_spent || 0);
        const remaining = budgetTotal - spentTotal;
        const overspent = remaining < 0;

        return res.status(200).json({
            success: true,
            data: {
                project_id: project.id,
                project_name: project.name,
                agency_id: project.agency_id,
                budget_total: budgetTotal,
                spent_total: spentTotal,
                remaining,
                overspent,
            },
        });
    } catch (error) {
        console.error('Error fetching project financials:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project financials',
            error: error.message,
        });
    }
};