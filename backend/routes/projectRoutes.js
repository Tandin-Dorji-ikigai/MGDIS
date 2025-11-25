const express = require('express');
const router = express.Router();

const {
    createProject,
    getProjects,
    getPublicProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getProjectFinancials
} = require('../controllers/projectController');

router.get('/:id/financials', getProjectFinancials);

router.get('/public', getPublicProjects);

router.get('/:id', getProjectById);

router.get('/', getProjects);

router.post('/', createProject);

router.put('/:id', updateProject);

router.delete('/:id', deleteProject);


module.exports = router;
