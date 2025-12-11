const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LeaveType = require("../models/LeaveType");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
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
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Get default leave balance from leave types
    const leaveTypes = await LeaveType.find({ isActive: true });
    const leaveBalance = {
      sick: 30,
      personal: 10,
      vacation: 10,
    };

    leaveTypes.forEach((type) => {
      if (leaveBalance.hasOwnProperty(type.code)) {
        leaveBalance[type.code] = type.defaultDays;
      }
    });

    // Create user
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
      leaveBalance,
    });

    if (user) {
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
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        leaveBalance: user.leaveBalance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("supervisor", "firstName lastName email");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getMe };
