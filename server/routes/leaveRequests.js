const express = require("express");
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveRequestById,
  cancelLeaveRequest,
  updateLeaveRequest,
  getTeamLeaveRequests,
} = require("../controllers/leaveRequestController");
const { protect, supervisor, admin } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .post(protect, upload.array("attachments", 5), createLeaveRequest)
  .get(protect, getMyLeaveRequests);

router.get("/all", protect, admin, getAllLeaveRequests);
router.get("/pending", protect, supervisor, getPendingLeaveRequests);
router.get("/team", protect, getTeamLeaveRequests);

router.get("/:id", protect, getLeaveRequestById);
router.put("/:id", protect, updateLeaveRequest);
router.put("/:id/approve", protect, supervisor, approveLeaveRequest);
router.put("/:id/reject", protect, supervisor, rejectLeaveRequest);
router.put("/:id/cancel", protect, cancelLeaveRequest);

module.exports = router;
