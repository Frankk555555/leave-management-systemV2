const express = require("express");
const router = express.Router();
const {
  getWeeklyReport,
  n8nCallback,
} = require("../controllers/webhookController");

// Weekly report for n8n
router.get("/weekly-report", getWeeklyReport);

// Callback from n8n
router.post("/n8n-callback", n8nCallback);

module.exports = router;
