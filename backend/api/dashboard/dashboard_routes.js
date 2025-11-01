const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../../middleware/authMiddleware');
const { getUserInfo, getSummary } = require('../../controllers/dashboard_controller/dashboardController');

// all dashboard routes require authentication
router.get('/user-info', authenticateToken, getUserInfo);
router.get('/summary', authenticateToken, getSummary);

module.exports = router;