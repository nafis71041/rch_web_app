const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../../middleware/authMiddleware.js");
const {
  getChildByChildId,
  getChildrenByMotherId,
  getImmunizationsByChildId,
  updateImmunizationsByChildId,
} = require("../../controllers/child_controller/child_controller.js");

router.get("/by-id/:infantId", authenticateToken, getChildByChildId);
router.get("/by-mother/:motherId", authenticateToken, getChildrenByMotherId);
router.get("/immunization/:childId", authenticateToken, getImmunizationsByChildId);
router.put("/immunization/:childId", authenticateToken, updateImmunizationsByChildId);

module.exports = router;
