const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../../utils/authMiddleware');
const { registerEC, updateEC } = require('../../controllers/ec_controller/ec_controller');

// Only authenticated users can access EC routes
router.use(authenticateToken);

// Only ASHA and health_worker roles can register/update EC
router.post('/register', authorizeRoles('asha', 'health_worker'), registerEC);
router.put('/update/:mother_id', authorizeRoles('asha', 'health_worker'), updateEC);

module.exports = router;
