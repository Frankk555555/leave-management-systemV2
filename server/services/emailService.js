const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send notification email
const sendNotificationEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email not configured, skipping...");
      return false;
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"ระบบบริหารการลา" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Email templates
const sendLeaveRequestEmail = async (supervisor, employee, leaveRequest) => {
  const subject = `[คำขอลา] ${employee.firstName} ${
    employee.lastName
  } - ${getLeaveTypeName(leaveRequest.leaveType)}`;
  const html = `
    <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0;">📝 คำขอลาใหม่</h2>
      </div>
      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0;">
        <p><strong>พนักงาน:</strong> ${employee.firstName} ${
    employee.lastName
  }</p>
        <p><strong>แผนก:</strong> ${employee.department}</p>
        <p><strong>ประเภทการลา:</strong> ${getLeaveTypeName(
          leaveRequest.leaveType
        )}</p>
        <p><strong>วันที่:</strong> ${formatDate(
          leaveRequest.startDate
        )} - ${formatDate(leaveRequest.endDate)}</p>
        <p><strong>จำนวนวัน:</strong> ${leaveRequest.totalDays} วัน</p>
        <p><strong>เหตุผล:</strong> ${leaveRequest.reason}</p>
        <div style="margin-top: 20px;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/approvals" 
             style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ดูรายละเอียดและอนุมัติ
          </a>
        </div>
      </div>
    </div>
  `;

  return sendNotificationEmail(supervisor.email, subject, html);
};

const sendApprovalEmail = async (employee, leaveRequest, isApproved, note) => {
  const status = isApproved ? "อนุมัติแล้ว ✅" : "ไม่อนุมัติ ❌";
  const subject = `[${status}] คำขอลา${getLeaveTypeName(
    leaveRequest.leaveType
  )}ของคุณ`;
  const html = `
    <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${
        isApproved
          ? "linear-gradient(135deg, #11998e, #38ef7d)"
          : "linear-gradient(135deg, #ff6b6b, #ee5a5a)"
      }; padding: 20px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0;">${
          isApproved ? "✅ อนุมัติแล้ว" : "❌ ไม่อนุมัติ"
        }</h2>
      </div>
      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0;">
        <p>คำขอลาของคุณได้รับการ${isApproved ? "อนุมัติ" : "ปฏิเสธ"}แล้ว</p>
        <p><strong>ประเภทการลา:</strong> ${getLeaveTypeName(
          leaveRequest.leaveType
        )}</p>
        <p><strong>วันที่:</strong> ${formatDate(
          leaveRequest.startDate
        )} - ${formatDate(leaveRequest.endDate)}</p>
        <p><strong>จำนวนวัน:</strong> ${leaveRequest.totalDays} วัน</p>
        ${note ? `<p><strong>หมายเหตุ:</strong> ${note}</p>` : ""}
        <div style="margin-top: 20px;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/leave-history" 
             style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ดูประวัติการลา
          </a>
        </div>
      </div>
    </div>
  `;

  return sendNotificationEmail(employee.email, subject, html);
};

// Helper functions
const getLeaveTypeName = (type) => {
  const types = { sick: "ลาป่วย", personal: "ลากิจ", vacation: "ลาพักร้อน" };
  return types[type] || type;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

module.exports = {
  sendNotificationEmail,
  sendLeaveRequestEmail,
  sendApprovalEmail,
};
