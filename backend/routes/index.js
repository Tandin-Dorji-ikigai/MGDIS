const express = require('express');
const router = express.Router();

const roleRoutes = require('./roleRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const agencyRoutes = require('./agencyRoutes');
const projectRoutes = require('./projectRoutes');
const milestoneRoutes = require('./milestoneRoutes');
const expenditureRoutes = require('./expenditureRoutes');

router.use('/roles', roleRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/agencies', agencyRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/expenditures', expenditureRoutes);

module.exports = router;
