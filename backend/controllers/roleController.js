const Role = require('../models/roleModel');

// GET /api/roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

// GET /api/roles/:id
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ message: 'Failed to fetch role' });
  }
};

// POST /api/roles
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'nameis required' });
    }

    const existing = await Role.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Role already exists' });
    }

    const role = await Role.create({ name });
    res.status(201).json(role);
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ message: 'Failed to create role' });
  }
};

// PUT /api/roles/:id
exports.updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (name) {
      role.name = name;
    }

    await role.save();
    res.json(role);
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

// DELETE /api/roles/:id
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await role.destroy();
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ message: 'Failed to delete role' });
  }
};
