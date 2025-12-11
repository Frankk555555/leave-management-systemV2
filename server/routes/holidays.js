const express = require("express");
const router = express.Router();
const {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  initializeHolidays,
} = require("../controllers/holidayController");
const { protect, admin } = require("../middleware/auth");

router.route("/").get(protect, getHolidays).post(protect, admin, createHoliday);

router.post("/init", protect, admin, initializeHolidays);

router
  .route("/:id")
  .put(protect, admin, updateHoliday)
  .delete(protect, admin, deleteHoliday);

module.exports = router;
