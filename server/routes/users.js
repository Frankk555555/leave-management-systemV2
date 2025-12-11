const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSupervisors,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/auth");

router.get("/supervisors", getSupervisors); // Public - needed for registration
router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
