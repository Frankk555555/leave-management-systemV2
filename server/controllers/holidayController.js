const Holiday = require("../models/Holiday");

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
const getHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    let query = { isActive: true };

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create holiday
// @route   POST /api/holidays
// @access  Private/Admin
const createHoliday = async (req, res) => {
  try {
    const { name, date, description } = req.body;

    const holiday = await Holiday.create({
      name,
      date,
      description,
    });

    res.status(201).json(holiday);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update holiday
// @route   PUT /api/holidays/:id
// @access  Private/Admin
const updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    const { name, date, description, isActive } = req.body;

    holiday.name = name || holiday.name;
    holiday.date = date || holiday.date;
    holiday.description =
      description !== undefined ? description : holiday.description;
    holiday.isActive = isActive !== undefined ? isActive : holiday.isActive;

    const updatedHoliday = await holiday.save();
    res.json(updatedHoliday);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete holiday
// @route   DELETE /api/holidays/:id
// @access  Private/Admin
const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: "Holiday removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Initialize default holidays for current year
// @route   POST /api/holidays/init
// @access  Private/Admin
const initializeHolidays = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const defaultHolidays = [
      {
        name: "วันขึ้นปีใหม่",
        date: new Date(year, 0, 1),
        description: "New Year's Day",
      },
      {
        name: "วันมาฆบูชา",
        date: new Date(year, 1, 24),
        description: "Makha Bucha Day",
      },
      {
        name: "วันจักรี",
        date: new Date(year, 3, 6),
        description: "Chakri Memorial Day",
      },
      {
        name: "วันสงกรานต์",
        date: new Date(year, 3, 13),
        description: "Songkran Festival",
      },
      {
        name: "วันสงกรานต์",
        date: new Date(year, 3, 14),
        description: "Songkran Festival",
      },
      {
        name: "วันสงกรานต์",
        date: new Date(year, 3, 15),
        description: "Songkran Festival",
      },
      {
        name: "วันแรงงานแห่งชาติ",
        date: new Date(year, 4, 1),
        description: "National Labour Day",
      },
      {
        name: "วันฉัตรมงคล",
        date: new Date(year, 4, 4),
        description: "Coronation Day",
      },
      {
        name: "วันวิสาขบูชา",
        date: new Date(year, 4, 22),
        description: "Visakha Bucha Day",
      },
      {
        name: "วันเฉลิมพระชนมพรรษา ร.10",
        date: new Date(year, 6, 28),
        description: "H.M. King's Birthday",
      },
      {
        name: "วันเฉลิมพระชนมพรรษา พระราชินี",
        date: new Date(year, 7, 12),
        description: "H.M. Queen's Birthday",
      },
      {
        name: "วันคล้ายวันสวรรคต ร.9",
        date: new Date(year, 9, 13),
        description: "King Bhumibol Memorial Day",
      },
      {
        name: "วันปิยมหาราช",
        date: new Date(year, 9, 23),
        description: "Chulalongkorn Day",
      },
      {
        name: "วันคล้ายวันพระบรมราชสมภพ ร.9",
        date: new Date(year, 11, 5),
        description: "King Bhumibol's Birthday",
      },
      {
        name: "วันรัฐธรรมนูญ",
        date: new Date(year, 11, 10),
        description: "Constitution Day",
      },
      {
        name: "วันสิ้นปี",
        date: new Date(year, 11, 31),
        description: "New Year's Eve",
      },
    ];

    for (const holiday of defaultHolidays) {
      const exists = await Holiday.findOne({
        date: {
          $gte: new Date(holiday.date.setHours(0, 0, 0, 0)),
          $lt: new Date(holiday.date.setHours(23, 59, 59, 999)),
        },
      });
      if (!exists) {
        await Holiday.create(holiday);
      }
    }

    const holidays = await Holiday.find({
      date: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31),
      },
    }).sort({ date: 1 });

    res.json(holidays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  initializeHolidays,
};
