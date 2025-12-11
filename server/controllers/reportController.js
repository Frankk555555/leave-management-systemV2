const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const LeaveType = require("../models/LeaveType");

// @desc    Get leave statistics
// @route   GET /api/reports/statistics
// @access  Private/Admin
const getLeaveStatistics = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Get all leave requests for the year
    const leaveRequests = await LeaveRequest.find({
      startDate: { $gte: startDate, $lte: endDate },
    }).populate("employee", "firstName lastName department");

    // Statistics by type
    const byType = leaveRequests.reduce((acc, req) => {
      acc[req.leaveType] = (acc[req.leaveType] || 0) + req.totalDays;
      return acc;
    }, {});

    // Statistics by department
    const byDepartment = leaveRequests.reduce((acc, req) => {
      const dept = req.employee?.department || "ไม่ระบุ";
      acc[dept] = (acc[dept] || 0) + req.totalDays;
      return acc;
    }, {});

    // Statistics by month
    const byMonth = Array(12).fill(0);
    leaveRequests.forEach((req) => {
      const month = new Date(req.startDate).getMonth();
      byMonth[month] += req.totalDays;
    });

    // Statistics by status
    const byStatus = leaveRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    // Total employees
    const totalEmployees = await User.countDocuments({ isActive: true });

    res.json({
      year: currentYear,
      totalRequests: leaveRequests.length,
      totalDays: leaveRequests.reduce((sum, r) => sum + r.totalDays, 0),
      totalEmployees,
      byType,
      byDepartment,
      byMonth,
      byStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Export leave report to Excel
// @route   GET /api/reports/export/excel
// @access  Private/Admin
const exportToExcel = async (req, res) => {
  try {
    const { year, month } = req.query;

    let query = {};
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("employee", "employeeId firstName lastName department position")
      .populate("approvedBy", "firstName lastName")
      .sort({ startDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("รายงานการลา");

    // Header styling
    worksheet.columns = [
      { header: "รหัสพนักงาน", key: "employeeId", width: 15 },
      { header: "ชื่อ-นามสกุล", key: "employeeName", width: 25 },
      { header: "แผนก", key: "department", width: 20 },
      { header: "ประเภทการลา", key: "leaveType", width: 15 },
      { header: "วันที่เริ่ม", key: "startDate", width: 15 },
      { header: "วันที่สิ้นสุด", key: "endDate", width: 15 },
      { header: "จำนวนวัน", key: "totalDays", width: 12 },
      { header: "สถานะ", key: "status", width: 15 },
      { header: "ผู้อนุมัติ", key: "approvedBy", width: 20 },
      { header: "เหตุผล", key: "reason", width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "667eea" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFF" }, bold: true };

    // Add data
    const leaveTypeNames = {
      sick: "ลาป่วย",
      personal: "ลากิจ",
      vacation: "ลาพักร้อน",
    };
    const statusNames = {
      pending: "รออนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ไม่อนุมัติ",
    };

    leaveRequests.forEach((request) => {
      worksheet.addRow({
        employeeId: request.employee?.employeeId || "",
        employeeName: `${request.employee?.firstName || ""} ${
          request.employee?.lastName || ""
        }`,
        department: request.employee?.department || "",
        leaveType: leaveTypeNames[request.leaveType] || request.leaveType,
        startDate: new Date(request.startDate).toLocaleDateString("th-TH"),
        endDate: new Date(request.endDate).toLocaleDateString("th-TH"),
        totalDays: request.totalDays,
        status: statusNames[request.status] || request.status,
        approvedBy: request.approvedBy
          ? `${request.approvedBy.firstName} ${request.approvedBy.lastName}`
          : "",
        reason: request.reason,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leave-report-${year || "all"}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Export leave report to PDF
// @route   GET /api/reports/export/pdf
// @access  Private/Admin
const exportToPDF = async (req, res) => {
  try {
    const { year, month } = req.query;

    let query = {};
    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("employee", "employeeId firstName lastName department")
      .sort({ startDate: -1 });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leave-report-${year || "all"}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("รายงานการลา", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`ปี: ${year || "ทั้งหมด"}`, { align: "center" });
    doc.moveDown(2);

    // Summary
    const stats = {
      total: leaveRequests.length,
      approved: leaveRequests.filter((r) => r.status === "approved").length,
      pending: leaveRequests.filter((r) => r.status === "pending").length,
      rejected: leaveRequests.filter((r) => r.status === "rejected").length,
    };

    doc.fontSize(14).text("สรุป", { underline: true });
    doc.fontSize(12);
    doc.text(`จำนวนคำขอทั้งหมด: ${stats.total}`);
    doc.text(`อนุมัติแล้ว: ${stats.approved}`);
    doc.text(`รออนุมัติ: ${stats.pending}`);
    doc.text(`ไม่อนุมัติ: ${stats.rejected}`);
    doc.moveDown(2);

    // Table header
    const leaveTypeNames = {
      sick: "ลาป่วย",
      personal: "ลากิจ",
      vacation: "ลาพักร้อน",
    };

    doc.fontSize(14).text("รายละเอียด", { underline: true });
    doc.moveDown();

    leaveRequests.slice(0, 50).forEach((request, index) => {
      doc.fontSize(10);
      doc.text(
        `${index + 1}. ${request.employee?.firstName || ""} ${
          request.employee?.lastName || ""
        } - ${leaveTypeNames[request.leaveType] || request.leaveType}`
      );
      doc.text(
        `   วันที่: ${new Date(request.startDate).toLocaleDateString(
          "th-TH"
        )} - ${new Date(request.endDate).toLocaleDateString("th-TH")} (${
          request.totalDays
        } วัน)`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reset yearly leave balance for all employees
// @route   POST /api/reports/reset-yearly
// @access  Private/Admin
const resetYearlyLeaveBalance = async (req, res) => {
  try {
    // Get default leave days from LeaveType
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

    // Update all active users
    const result = await User.updateMany(
      { isActive: true },
      { $set: { leaveBalance } }
    );

    res.json({
      message: "รีเซ็ตวันลาประจำปีเรียบร้อยแล้ว",
      updatedCount: result.modifiedCount,
      leaveBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all leave requests (admin)
// @route   GET /api/reports/all-requests
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    const { year, status, department } = req.query;

    let query = {};

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    let leaveRequests = await LeaveRequest.find(query)
      .populate("employee", "employeeId firstName lastName department position")
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    if (department) {
      leaveRequests = leaveRequests.filter(
        (r) => r.employee?.department === department
      );
    }

    res.json(leaveRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getLeaveStatistics,
  exportToExcel,
  exportToPDF,
  resetYearlyLeaveBalance,
  getAllRequests,
};
