const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../../middleware/authMiddleware.js");
const {
  getChildByChildId,
  getChildrenByMotherId,
} = require("../../controllers/child_controller/child_controller.js");


router.get("/by-id/:infantId", authenticateToken, getChildByChildId);
router.get("/by-mother/:motherId", authenticateToken, getChildrenByMotherId);

module.exports = router;