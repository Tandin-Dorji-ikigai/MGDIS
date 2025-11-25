const express = require('express');
const router = express.Router();
const expenditureController = require('../controllers/expenditureController');

// const { authGuard } = require('../middleware/auth'); // if you have auth

// Base path: /api/v1/expenditures

// Create
router.post(
    '/',
    // authGuard,
    expenditureController.createExpenditure
);

// List with filters + pagination
router.get(
    '/',
    // authGuard,
    expenditureController.getExpenditures
);

// List expenditures for a specific project
router.get(
    '/project/:projectId',
    // authGuard,
    expenditureController.getExpendituresByProject
);

// Get single expenditure
router.get(
    '/:id',
    // authGuard,
    expenditureController.getExpenditureById
);

// Update
router.put(
    '/:id',
    // authGuard,
    expenditureController.updateExpenditure
);

// Delete
router.delete(
    '/:id',
    // authGuard,
    expenditureController.deleteExpenditure
);

module.exports = router;
