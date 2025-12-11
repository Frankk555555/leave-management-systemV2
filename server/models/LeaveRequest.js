const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "sick", // ลาป่วย
        "personal", // ลากิจส่วนตัว
        "vacation", // ลาพักผ่อน
        "maternity", // ลาคลอดบุตร
        "paternity", // ลาช่วยภรรยาคลอด
        "childcare", // ลากิจเลี้ยงดูบุตร
        "ordination", // ลาอุปสมบท/ฮัจย์
        "military", // ลาตรวจเลือก/เตรียมพล
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    workingDays: {
      type: Number,
      default: 0, // จำนวนวันทำการจริง (หักวันหยุด)
    },
    reason: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    // สำหรับลาป่วย - ต้องมีใบรับรองแพทย์หรือไม่
    hasMedicalCertificate: {
      type: Boolean,
      default: false,
    },
    // สำหรับลาป่วยรักษานาน
    isLongTermSick: {
      type: Boolean,
      default: false,
    },
    // สำหรับลาช่วยภรรยาคลอด - วันที่ภรรยาคลอด
    childBirthDate: {
      type: Date,
      default: null,
    },
    // สำหรับลาอุปสมบท/ฮัจย์ - วันที่จะอุปสมบท/เดินทาง
    ceremonyDate: {
      type: Date,
      default: null,
    },
    // เป็นการลาที่ได้รับเงินเดือนหรือไม่
    isPaidLeave: {
      type: Boolean,
      default: true,
    },
    // ปีงบประมาณที่ใช้สิทธิ์
    fiscalYear: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    approvalNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Calculate fiscal year before saving (Oct 1 - Sep 30)
leaveRequestSchema.pre("save", function (next) {
  if (this.startDate) {
    const date = new Date(this.startDate);
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    // If month is Oct-Dec (9-11), fiscal year is next year
    // If month is Jan-Sep (0-8), fiscal year is current year
    this.fiscalYear = month >= 9 ? year + 1 : year;
  }
  next();
});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
