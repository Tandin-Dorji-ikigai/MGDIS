const { Op } = require('sequelize');
const Expenditure = require('../models/expenditureModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

const expenditureInclude = [
    {
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'category', 'start_date', 'end_date']
    },
    {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'email']
    }
];

// Create a new expenditure
exports.createExpenditure = async (req, res) => {
    try {
        const {
            project_id,
            amount,
            description,
            spend_date,
            created_by,
        } = req.body;

        if (!project_id || amount === undefined || !spend_date) {
            return res.status(400).json({
                success: false,
                message: 'project_id, amount and spend_date are required',
            });
        }

        if (Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: 'amount must be >= 0',
            });
        }

        const expenditure = await Expenditure.create({
            project_id,
            amount,
            description,
            spend_date,
            created_by,
        });

        await expenditure.reload({ include: expenditureInclude });

        return res.status(201).json({
            success: true,
            message: 'Expenditure created successfully',
            data: expenditure,
        });
    } catch (error) {
        console.error('Error creating expenditure:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create expenditure',
            error: error.message,
        });
    }
};

// Get all expenditures (filters + pagination)
exports.getExpenditures = async (req, res) => {
    try {
        const {
            project_id,
            created_by,
            min_amount,
            max_amount,
            date_from,
            date_to,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const where = {};

        if (project_id) where.project_id = project_id;
        if (created_by) where.created_by = created_by;

        if (min_amount) {
            where.amount = { ...(where.amount || {}), [Op.gte]: min_amount };
        }
        if (max_amount) {
            where.amount = { ...(where.amount || {}), [Op.lte]: max_amount };
        }

        if (date_from) {
            where.spend_date = { ...(where.spend_date || {}), [Op.gte]: date_from };
        }
        if (date_to) {
            where.spend_date = { ...(where.spend_date || {}), [Op.lte]: date_to };
        }

        if (search) {
            where.description = {
                [Op.iLike]: `%${search}%`,
            };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await Expenditure.findAndCountAll({
            where,
            include: expenditureInclude,
            order: [['spend_date', 'DESC']],
            limit: limitNum,
            offset,
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
        console.error('Error fetching expenditures:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expenditures',
            error: error.message,
        });
    }
};

// Get expenditures for a specific project
exports.getExpendituresByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const {
            min_amount,
            max_amount,
            date_from,
            date_to,
            page = 1,
            limit = 10,
        } = req.query;

        const where = { project_id: projectId };

        if (min_amount) {
            where.amount = { ...(where.amount || {}), [Op.gte]: min_amount };
        }
        if (max_amount) {
            where.amount = { ...(where.amount || {}), [Op.lte]: max_amount };
        }

        if (date_from) {
            where.spend_date = { ...(where.spend_date || {}), [Op.gte]: date_from };
        }
        if (date_to) {
            where.spend_date = { ...(where.spend_date || {}), [Op.lte]: date_to };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await Expenditure.findAndCountAll({
            where,
            include: expenditureInclude,
            order: [['spend_date', 'DESC']],
            limit: limitNum,
            offset,
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
        console.error('Error fetching project expenditures:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project expenditures',
            error: error.message,
        });
    }
};

// Get single expenditure by ID
exports.getExpenditureById = async (req, res) => {
    try {
        const { id } = req.params;

        const expenditure = await Expenditure.findByPk(id, {
            include: expenditureInclude,
        });

        if (!expenditure) {
            return res.status(404).json({
                success: false,
                message: 'Expenditure not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: expenditure,
        });
    } catch (error) {
        console.error('Error fetching expenditure:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expenditure',
            error: error.message,
        });
    }
};

// Update expenditure
exports.updateExpenditure = async (req, res) => {
    try {
        const { id } = req.params;

        const expenditure = await Expenditure.findByPk(id);

        if (!expenditure) {
            return res.status(404).json({
                success: false,
                message: 'Expenditure not found',
            });
        }

        const {
            project_id,
            amount,
            description,
            spend_date,
            created_by,
        } = req.body;

        if (amount !== undefined && Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: 'amount must be >= 0',
            });
        }

        await expenditure.update({
            project_id: project_id ?? expenditure.project_id,
            amount: amount ?? expenditure.amount,
            description: description ?? expenditure.description,
            spend_date: spend_date ?? expenditure.spend_date,
            created_by: created_by ?? expenditure.created_by,
        });

        await expenditure.reload({ include: expenditureInclude });

        return res.status(200).json({
            success: true,
            message: 'Expenditure updated successfully',
            data: expenditure,
        });
    } catch (error) {
        console.error('Error updating expenditure:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update expenditure',
            error: error.message,
        });
    }
};

// Delete expenditure
exports.deleteExpenditure = async (req, res) => {
    try {
        const { id } = req.params;

        const expenditure = await Expenditure.findByPk(id);

        if (!expenditure) {
            return res.status(404).json({
                success: false,
                message: 'Expenditure not found',
            });
        }

        await expenditure.destroy();

        return res.status(200).json({
            success: true,
            message: 'Expenditure deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting expenditure:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete expenditure',
            error: error.message,
        });
    }
};
