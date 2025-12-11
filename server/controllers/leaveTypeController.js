const LeaveType = require("../models/LeaveType");

// @desc    Get all leave types
// @route   GET /api/leave-types
// @access  Private
const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true });
    res.json(leaveTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create leave type
// @route   POST /api/leave-types
// @access  Private/Admin
const createLeaveType = async (req, res) => {
  try {
    const { name, code, description, defaultDays } = req.body;

    const exists = await LeaveType.findOne({ code });
    if (exists) {
      return res.status(400).json({ message: "Leave type already exists" });
    }

    const leaveType = await LeaveType.create({
      name,
      code,
      description,
      defaultDays,
    });

    res.status(201).json(leaveType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update leave type
// @route   PUT /api/leave-types/:id
// @access  Private/Admin
const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    const { name, description, defaultDays, isActive } = req.body;

    leaveType.name = name || leaveType.name;
    leaveType.description =
      description !== undefined ? description : leaveType.description;
    leaveType.defaultDays = defaultDays || leaveType.defaultDays;
    leaveType.isActive = isActive !== undefined ? isActive : leaveType.isActive;

    const updatedLeaveType = await leaveType.save();
    res.json(updatedLeaveType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete leave type
// @route   DELETE /api/leave-types/:id
// @access  Private/Admin
const deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    await LeaveType.findByIdAndDelete(req.params.id);
    res.json({ message: "Leave type removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Initialize default leave types
// @route   POST /api/leave-types/init
// @access  Private/Admin
const initializeLeaveTypes = async (req, res) => {
  try {
    const defaultTypes = [
      {
        name: "ลาป่วย",
        code: "sick",
        description: "การลาเนื่องจากเจ็บป่วย",
        defaultDays: 30,
      },
      {
        name: "ลากิจ",
        code: "personal",
        description: "การลาเพื่อทำกิจธุระส่วนตัว",
        defaultDays: 10,
      },
      {
        name: "ลาพักร้อน",
        code: "vacation",
        description: "การลาพักผ่อนประจำปี",
        defaultDays: 10,
      },
    ];

    for (const type of defaultTypes) {
      const exists = await LeaveType.findOne({ code: type.code });
      if (!exists) {
        await LeaveType.create(type);
      }
    }

    const leaveTypes = await LeaveType.find({});
    res.json(leaveTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  initializeLeaveTypes,
};
