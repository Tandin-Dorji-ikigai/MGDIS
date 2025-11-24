const { Agency } = require('../models');

// GET /api/agencies
exports.getAllAgencies = async (req, res) => {
    try {
        const agencies = await Agency.findAll({
            order: [['created_at', 'DESC']],
        });

        return res.json({
            success: true,
            message: 'Agencies fetched successfully',
            agencies,
        });
    } catch (err) {
        console.error('Error fetching agencies:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agencies',
        });
    }
};

// GET /api/agencies/:id
exports.getAgencyById = async (req, res) => {
    try {
        const agency = await Agency.findByPk(req.params.id);

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agency not found',
            });
        }

        return res.json({
            success: true,
            message: 'Agency fetched successfully',
            agency,
        });
    } catch (err) {
        console.error('Error fetching agency:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agency',
        });
    }
};

// POST /api/agencies
exports.createAgency = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'name is required',
            });
        }

        const existing = await Agency.findOne({ where: { name } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Agency with this name already exists',
            });
        }

        const agency = await Agency.create({
            name,
            description: description || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Agency created successfully',
            agency,
        });
    } catch (err) {
        console.error('Error creating agency:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to create agency',
        });
    }
};

// PUT /api/agencies/:id
exports.updateAgency = async (req, res) => {
    try {
        const { name, description } = req.body;

        const agency = await Agency.findByPk(req.params.id);
        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agency not found',
            });
        }

        if (name && name !== agency.name) {
            const existing = await Agency.findOne({ where: { name } });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Agency with this name already exists',
                });
            }
            agency.name = name;
        }

        if (description !== undefined) {
            agency.description = description;
        }

        await agency.save();

        return res.json({
            success: true,
            message: 'Agency updated successfully',
            agency,
        });
    } catch (err) {
        console.error('Error updating agency:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update agency',
        });
    }
};

// DELETE /api/agencies/:id
exports.deleteAgency = async (req, res) => {
    try {
        const agency = await Agency.findByPk(req.params.id);

        if (!agency) {
            return res.status(404).json({
                success: false,
                message: 'Agency not found',
            });
        }

        await agency.destroy();

        return res.json({
            success: true,
            message: 'Agency deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting agency:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete agency',
        });
    }
};
