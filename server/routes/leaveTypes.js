const express = require("express");
const router = express.Router();
const {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  initializeLeaveTypes,
} = require("../controllers/leaveTypeController");
const { protect, admin } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getLeaveTypes)
  .post(protect, admin, createLeaveType);

router.post("/init", protect, admin, initializeLeaveTypes);

router
  .route("/:id")
  .put(protect, admin, updateLeaveType)
  .delete(protect, admin, deleteLeaveType);

module.exports = router;
