const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../../middleware/authMiddleware');
const { getECVillages, getAshaByVillage, registerEC, getLastVisit, registerECVisit} = require('../../controllers/ec_controller/ec_controller')

router.get('/villages', authenticateToken, getECVillages);
router.get('/asha-by-village/:village_id', authenticateToken, getAshaByVillage);
router.post('/register', authenticateToken, registerEC);
router.get('/last-visit/:mother_id', authenticateToken, getLastVisit);
router.post('/register-visit/:mother_id', authenticateToken, registerECVisit);
module.exports = router;
