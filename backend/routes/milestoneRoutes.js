// backend/routes/milestoneRoutes.js
const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');

// If you have auth middleware:
// const { authGuard } = require('../middleware/auth');

// Base path: /api/v1/milestones

// Create
router.post('/', /* authGuard, */ milestoneController.createMilestone);

// List with filters + pagination
router.get('/', /* authGuard, */ milestoneController.getMilestones);

// Get milestones for a specific project
router.get(
    '/project/:projectId',
    /* authGuard, */
    milestoneController.getMilestonesByProject
);

// Get single milestone
router.get('/:id', /* authGuard, */ milestoneController.getMilestoneById);

// Update
router.put('/:id', /* authGuard, */ milestoneController.updateMilestone);

// Delete
router.delete('/:id', /* authGuard, */ milestoneController.deleteMilestone);

module.exports = router;
