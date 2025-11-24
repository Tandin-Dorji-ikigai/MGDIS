const express = require('express');
const router = express.Router();

const roleRoutes = require('./roleRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');


router.use('/roles', roleRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
