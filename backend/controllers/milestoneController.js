const { Op } = require('sequelize');
const Milestone = require('../models/milestoneModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

// Common include object
const milestoneInclude = [
    {
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'category', 'start_date', 'end_date']
    },
    {
        model: User,
        as: 'updatedBy',
        attributes: ['id', 'username', 'email']
    }
];

// Create a new milestone
exports.createMilestone = async (req, res) => {
    try {
        const {
            project_id,
            name,
            target_date,
            actual_date,
            status,
            updated_by,
        } = req.body;

        if (!project_id || !name || !target_date) {
            return res.status(400).json({
                success: false,
                message: 'project_id, name and target_date are required',
            });
        }

        const milestone = await Milestone.create({
            project_id,
            name,
            target_date,
            actual_date,
            status,
            updated_by,
        });

        // Reload with associations
        await milestone.reload({ include: milestoneInclude });

        return res.status(201).json({
            success: true,
            message: 'Milestone created successfully',
            data: milestone,
        });
    } catch (error) {
        console.error('Error creating milestone:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create milestone',
            error: error.message,
        });
    }
};

// Get all milestones
exports.getMilestones = async (req, res) => {
    try {
        const {
            project_id,
            status,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const where = {};

        if (project_id) where.project_id = project_id;
        if (status) where.status = status;

        if (search) {
            where.name = {
                [Op.iLike]: `%${search}%`,
            };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await Milestone.findAndCountAll({
            where,
            include: milestoneInclude,
            order: [['target_date', 'ASC']],
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
        console.error('Error fetching milestones:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch milestones',
            error: error.message,
        });
    }
};

// Get milestones for specific project
exports.getMilestonesByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const {
            status,
            page = 1,
            limit = 10,
        } = req.query;

        const where = { project_id: projectId };
        if (status) where.status = status;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await Milestone.findAndCountAll({
            where,
            include: milestoneInclude,
            order: [['target_date', 'ASC']],
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
        console.error('Error fetching project milestones:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project milestones',
            error: error.message,
        });
    }
};

// Get single milestone by ID
exports.getMilestoneById = async (req, res) => {
    try {
        const { id } = req.params;

        const milestone = await Milestone.findByPk(id, {
            include: milestoneInclude
        });

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: 'Milestone not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: milestone,
        });
    } catch (error) {
        console.error('Error fetching milestone:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch milestone',
            error: error.message,
        });
    }
};

// Update milestone
exports.updateMilestone = async (req, res) => {
    try {
        const { id } = req.params;

        const milestone = await Milestone.findByPk(id);

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: 'Milestone not found',
            });
        }

        const {
            project_id,
            name,
            target_date,
            actual_date,
            status,
            updated_by,
        } = req.body;

        await milestone.update({
            project_id: project_id ?? milestone.project_id,
            name: name ?? milestone.name,
            target_date: target_date ?? milestone.target_date,
            actual_date: actual_date ?? milestone.actual_date,
            status: status ?? milestone.status,
            updated_by: updated_by ?? milestone.updated_by,
            updated_at: new Date(),
        });

        await milestone.reload({ include: milestoneInclude });

        return res.status(200).json({
            success: true,
            message: 'Milestone updated successfully',
            data: milestone,
        });
    } catch (error) {
        console.error('Error updating milestone:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update milestone',
            error: error.message,
        });
    }
};

// Delete milestone
exports.deleteMilestone = async (req, res) => {
    try {
        const { id } = req.params;

        const milestone = await Milestone.findByPk(id);

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: 'Milestone not found',
            });
        }

        await milestone.destroy();

        return res.status(200).json({
            success: true,
            message: 'Milestone deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting milestone:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete milestone',
            error: error.message,
        });
    }
};
