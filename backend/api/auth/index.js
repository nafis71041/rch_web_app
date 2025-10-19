const express = require('express');
const router = express.Router();
const { login, changePassword, logout, register} = require('../../controllers/auth_controller/auth_controller');
const {authenticateToken, authorizeRoles} = require('../../middleware/authMiddleware');

router.get('/login', (req, res) => {
  res.send('Login route works!');
});
router.get('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({valid: true, user: req.user});
});
router.post('/login', login);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);
router.post('/register', authenticateToken, authorizeRoles('admin'), register);

module.exports = router;