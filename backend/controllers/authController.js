// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Role = require('../models/roleModel');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role_id: user.role_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

exports.register = async (req, res) => {
    try {
        const { username, email, password, role_id } = req.body;

        if (!username || !email || !password || !role_id) {
            return res
                .status(400)
                .json({ message: 'username, email, password and role_id are required' });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const role = await Role.findByPk(role_id);
        if (!role) {
            return res.status(400).json({ message: 'Role does not exits' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role_id,
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
            },
            token,
        });

    } catch (err) {
        console.error('Error in register:', err);
        return res.status(500).json({ message: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: 'email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Password Incorrect",
            });

        }

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
            },
            token,
        });

    } catch (err) {
        console.error('Error in login:', err);
        return res.status(500).json({ message: 'Login failed' });
    }
};


exports.me = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'role_id', 'created_at', 'updated_at'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ user });
    } catch (err) {
        console.error('Error in me:', err);
        return res.status(500).json({ message: 'Failed to fetch profile' });
    }
};
