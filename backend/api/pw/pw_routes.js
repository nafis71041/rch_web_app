const express = require("express");
const router = express.Router();
const { getPregnanciesByMotherId, getPregnancyById, registerPregnancy, addDeliveryDetails, addInfantDetails } = require("../../controllers/pw_controller/pw_controller.js");
const { authenticateToken } = require("../../middleware/authMiddleware.js");

router.get("/pregnancies/:motherId", authenticateToken, getPregnanciesByMotherId);
router.get("/pregnancy/:pregnancyId", authenticateToken, getPregnancyById);
router.post("/registration", authenticateToken, registerPregnancy);
router.post("/delivery", authenticateToken, addDeliveryDetails);
router.post("/infant", authenticateToken, addInfantDetails);

module.exports = router;
