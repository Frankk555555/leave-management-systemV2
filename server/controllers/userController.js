const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate("supervisor", "firstName lastName email");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("supervisor", "firstName lastName email");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      password,
      department,
      position,
      role,
      supervisor,
      leaveBalance,
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      employeeId,
      firstName,
      lastName,
      email,
      password,
      department,
      position,
      role: role || "employee",
      supervisor: supervisor || null,
      leaveBalance: leaveBalance || { sick: 30, personal: 10, vacation: 10 },
    });

    res.status(201).json({
      _id: user._id,
      employeeId: user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      position: user.position,
      role: user.role,
      leaveBalance: user.leaveBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      firstName,
      lastName,
      email,
      department,
      position,
      role,
      supervisor,
      leaveBalance,
      isActive,
    } = req.body;

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.department = department || user.department;
    user.position = position || user.position;
    user.role = role || user.role;
    user.supervisor = supervisor !== undefined ? supervisor : user.supervisor;
    user.leaveBalance = leaveBalance || user.leaveBalance;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      employeeId: updatedUser.employeeId,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      department: updatedUser.department,
      position: updatedUser.position,
      role: updatedUser.role,
      leaveBalance: updatedUser.leaveBalance,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get supervisors
// @route   GET /api/users/supervisors
// @access  Private
const getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({
      role: { $in: ["supervisor", "admin"] },
    }).select("_id employeeId firstName lastName email department");
    res.json(supervisors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSupervisors,
};
