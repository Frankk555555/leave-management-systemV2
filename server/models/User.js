const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "supervisor", "admin"],
      default: "employee",
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // วันที่เริ่มงาน
    startDate: {
      type: Date,
      default: Date.now,
    },
    // สิทธิ์วันลาคงเหลือ
    leaveBalance: {
      sick: { type: Number, default: 60 }, // ลาป่วย 60 วัน/ปี
      sickLongTerm: { type: Number, default: 120 }, // ลาป่วยรักษานาน 120 วัน/ปี
      personal: { type: Number, default: 45 }, // ลากิจ 45 วัน (ปีแรก 15)
      vacation: { type: Number, default: 10 }, // ลาพักผ่อน 10 วัน
      vacationAccumulated: { type: Number, default: 0 }, // วันลาพักผ่อนสะสม
      maternity: { type: Number, default: 90 }, // ลาคลอด 90 วัน
      paternity: { type: Number, default: 15 }, // ลาช่วยภรรยาคลอด 15 วัน
      childcare: { type: Number, default: 150 }, // ลาเลี้ยงดูบุตร 150 วัน
      ordination: { type: Number, default: 120 }, // ลาอุปสมบท/ฮัจย์ 120 วัน
      military: { type: Number, default: 999 }, // ลาตรวจเลือก (ไม่จำกัด)
    },
    // ติดตามการใช้สิทธิ์พิเศษ
    specialLeaveUsed: {
      hasUsedMaternity: { type: Boolean, default: false },
      maternityEndDate: { type: Date, default: null },
      hasUsedOrdination: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// คำนวณอายุงาน (ปี)
userSchema.virtual("yearsOfService").get(function () {
  if (!this.startDate) return 0;
  const now = new Date();
  const start = new Date(this.startDate);
  const diffTime = now - start;
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  return Math.floor(diffYears);
});

// ตรวจสอบว่าเป็นพนักงานปีแรกหรือไม่
userSchema.virtual("isFirstYear").get(function () {
  return this.yearsOfService < 1;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
