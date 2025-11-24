const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');

// GET /api/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        return res.json({
            success: true,
            message: 'Users fetched successfully',
            users,
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name'],  
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.json({
            success: true,
            message: 'User fetched successfully',
            user,
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
        });
    }
};


// POST /api/users  (admin-create user)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role_id } = req.body;

        if (!username || !email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                message: 'username, email, password and role_id are required',
            });
        }

        // check email uniqueness
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered',
            });
        }

        // verify role exists
        const role = await Role.findByPk(role_id);
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role_id',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role_id,
        });

        const { password: _, ...userWithoutPassword } = user.toJSON();

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: userWithoutPassword,
        });
    } catch (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
        });
    }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { username, email, password, role_id } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (email && email !== user.email) {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already registered',
                });
            }
            user.email = email;
        }

        if (username) user.username = username;

        if (role_id) {
            const role = await Role.findByPk(role_id);
            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role_id',
                });
            }
            user.role_id = role_id;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        const { password: _, ...userWithoutPassword } = user.toJSON();

        return res.json({
            success: true,
            message: 'User updated successfully',
            user: userWithoutPassword,
        });
    } catch (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
        });
    }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await user.destroy();

        return res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
        });
    }
};
