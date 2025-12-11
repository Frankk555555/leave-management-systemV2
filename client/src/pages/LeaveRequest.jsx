import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { leaveRequestsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import "./LeaveRequest.css";

const LeaveRequest = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: "",
    childBirthDate: "",
    ceremonyDate: "",
    hasMedicalCertificate: false,
    isLongTermSick: false,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  const getLeaveBalance = () => {
    const type = formData.leaveType;
    if (type === "military") return "ไม่จำกัด";
    return user?.leaveBalance?.[type] || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const days = calculateDays();
    if (days <= 0) {
      setError("กรุณาเลือกวันที่ให้ถูกต้อง");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("leaveType", formData.leaveType);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("reason", formData.reason);

      // Add conditional fields
      if (formData.leaveType === "paternity" && formData.childBirthDate) {
        formDataToSend.append("childBirthDate", formData.childBirthDate);
      }
      if (formData.leaveType === "ordination" && formData.ceremonyDate) {
        formDataToSend.append("ceremonyDate", formData.ceremonyDate);
      }
      if (formData.leaveType === "sick") {
        formDataToSend.append(
          "hasMedicalCertificate",
          formData.hasMedicalCertificate
        );
        formDataToSend.append("isLongTermSick", formData.isLongTermSick);
      }

      files.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const response = await leaveRequestsAPI.create(formDataToSend);

      if (response.data.message) {
        setSuccess(response.data.message);
      } else {
        setSuccess("ยื่นคำขอลาเรียบร้อยแล้ว");
      }

      setTimeout(() => {
        navigate("/leave-history");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { value: "sick", label: "ลาป่วย", icon: "🏥", color: "#11998e", days: 60 },
    {
      value: "personal",
      label: "ลากิจส่วนตัว",
      icon: "📋",
      color: "#667eea",
      days: 45,
    },
    {
      value: "vacation",
      label: "ลาพักผ่อน",
      icon: "🏖️",
      color: "#f6d365",
      days: 10,
    },
    {
      value: "maternity",
      label: "ลาคลอดบุตร",
      icon: "👶",
      color: "#ff6b9d",
      days: 90,
    },
    {
      value: "paternity",
      label: "ลาช่วยภรรยาคลอด",
      icon: "👨‍👩‍👦",
      color: "#4facfe",
      days: 15,
    },
    {
      value: "childcare",
      label: "ลาเลี้ยงดูบุตร",
      icon: "🍼",
      color: "#a8edea",
      days: 150,
    },
    {
      value: "ordination",
      label: "ลาอุปสมบท/ฮัจย์",
      icon: "🙏",
      color: "#ffecd2",
      days: 120,
    },
    {
      value: "military",
      label: "ลาตรวจเลือก",
      icon: "🎖️",
      color: "#667eea",
      days: "ไม่จำกัด",
    },
  ];

  const getLeaveInfo = () => {
    const type = formData.leaveType;
    switch (type) {
      case "sick":
        return "ลาป่วยตั้งแต่ 30 วันขึ้นไป ต้องมีใบรับรองแพทย์";
      case "maternity":
        return "ลาคลอดบุตรได้ไม่เกิน 90 วัน ไม่ต้องใบรับรองแพทย์";
      case "paternity":
        return "ลาช่วยภรรยาคลอดได้ 15 วันทำการ ภายใน 90 วันหลังคลอด";
      case "childcare":
        return "ลาเลี้ยงดูบุตรต่อเนื่องจากลาคลอด ไม่ได้รับเงินเดือน";
      case "ordination":
        return "ต้องยื่นคำขอล่วงหน้าอย่างน้อย 60 วัน";
      case "military":
        return "รายงานภายใน 48 ชม. อนุมัติอัตโนมัติ";
      case "personal":
        return "ปีแรก 15 วัน / ปีถัดไป 45 วัน";
      case "vacation":
        return "สะสมได้ไม่เกิน 20-30 วันตามอายุงาน";
      default:
        return "";
    }
  };

  return (
    <>
      <Navbar />
      <div className="leave-request-page">
        <div className="page-header">
          <h1>✍️ ยื่นคำขอลา</h1>
          <p>กรอกข้อมูลการลาของคุณ</p>
        </div>

        <div className="leave-request-container">
          <form onSubmit={handleSubmit} className="leave-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-section">
              <h3>ประเภทการลา</h3>
              <div className="leave-type-grid">
                {leaveTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`leave-type-card ${
                      formData.leaveType === type.value ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveType"
                      value={type.value}
                      checked={formData.leaveType === type.value}
                      onChange={handleChange}
                    />
                    <span
                      className="type-icon"
                      style={{ background: type.color }}
                    >
                      {type.icon}
                    </span>
                    <span className="type-label">{type.label}</span>
                    <span className="type-balance">
                      {type.days === "ไม่จำกัด"
                        ? "ไม่จำกัด"
                        : `เหลือ ${
                            user?.leaveBalance?.[type.value] || type.days
                          } วัน`}
                    </span>
                  </label>
                ))}
              </div>
              {getLeaveInfo() && (
                <div className="leave-info-box">ℹ️ {getLeaveInfo()}</div>
              )}
            </div>

            {/* Conditional Fields */}
            {formData.leaveType === "paternity" && (
              <div className="form-section conditional-section">
                <h3>👶 วันที่ภรรยาคลอดบุตร</h3>
                <input
                  type="date"
                  name="childBirthDate"
                  value={formData.childBirthDate}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.leaveType === "ordination" && (
              <div className="form-section conditional-section">
                <h3>🙏 วันที่อุปสมบท/เดินทางฮัจย์</h3>
                <input
                  type="date"
                  name="ceremonyDate"
                  value={formData.ceremonyDate}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.leaveType === "sick" && (
              <div className="form-section conditional-section">
                <h3>🏥 ข้อมูลเพิ่มเติม</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="hasMedicalCertificate"
                    checked={formData.hasMedicalCertificate}
                    onChange={handleChange}
                  />
                  มีใบรับรองแพทย์
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isLongTermSick"
                    checked={formData.isLongTermSick}
                    onChange={handleChange}
                  />
                  ลาป่วยเพื่อรักษาตัวเป็นเวลานาน (120 วัน/ปี)
                </label>
              </div>
            )}

            <div className="form-section">
              <h3>ช่วงวันที่ลา</h3>
              <div className="date-range">
                <div className="form-group">
                  <label htmlFor="startDate">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="date-separator">→</div>
                <div className="form-group">
                  <label htmlFor="endDate">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    required
                  />
                </div>
                <div className="days-count">
                  <span className="days-number">{calculateDays()}</span>
                  <span className="days-label">วัน</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>เหตุผลการลา</h3>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="ระบุเหตุผลการลา..."
                rows={4}
                required
              />
            </div>

            <div className="form-section">
              <h3>เอกสารแนบ (ถ้ามี)</h3>
              <div
                className="file-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  style={{ display: "none" }}
                />
                <div className="upload-icon">📎</div>
                <p>คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวาง</p>
                <span>รองรับ: JPG, PNG, PDF, DOC (สูงสุด 5 ไฟล์)</span>
              </div>

              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="remove-file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "กำลังส่ง..." : "ยื่นคำขอลา"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LeaveRequest;
