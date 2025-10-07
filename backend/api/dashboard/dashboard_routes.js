const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../../utils/authMiddleware');
const { getSummary } = require('../../controllers/dashboard_controller/dashboard_controller');

// Only authenticated users can access dashboard
router.get('/summary', authenticateToken, authorizeRoles('asha', 'health_worker', 'supervisor'), getSummary);

module.exports = router;
