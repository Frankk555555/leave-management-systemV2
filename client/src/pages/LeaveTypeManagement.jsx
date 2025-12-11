import React, { useState, useEffect } from "react";
import { leaveTypesAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import "./LeaveTypeManagement.css";

const LeaveTypeManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "sick",
    description: "",
    defaultDays: 10,
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveTypesAPI.getAll();
      setLeaveTypes(response.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm("ต้องการเพิ่มประเภทการลาเริ่มต้นหรือไม่?")) return;
    try {
      await leaveTypesAPI.initialize();
      fetchLeaveTypes();
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "number" ? parseInt(e.target.value) : e.target.value,
    });
  };

  const openModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        code: type.code,
        description: type.description || "",
        defaultDays: type.defaultDays,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        code: "sick",
        description: "",
        defaultDays: 10,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await leaveTypesAPI.update(editingType._id, formData);
      } else {
        await leaveTypesAPI.create(formData);
      }
      fetchLeaveTypes();
      setModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบประเภทการลานี้หรือไม่?")) return;
    try {
      await leaveTypesAPI.delete(id);
      fetchLeaveTypes();
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const getTypeIcon = (code) => {
    const icons = { sick: "🏥", personal: "📋", vacation: "🏖️" };
    return icons[code] || "📝";
  };

  const getTypeColor = (code) => {
    const colors = {
      sick: "linear-gradient(135deg, #11998e, #38ef7d)",
      personal: "linear-gradient(135deg, #667eea, #764ba2)",
      vacation: "linear-gradient(135deg, #f6d365, #fda085)",
    };
    return colors[code] || colors.sick;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="leave-type-management-page">
        <div className="page-header">
          <div>
            <h1>📝 จัดการประเภทการลา</h1>
            <p>กำหนดประเภทและจำนวนวันลา</p>
          </div>
          <div className="header-actions">
            <button className="init-btn" onClick={handleInitialize}>
              🔄 รีเซ็ตเป็นค่าเริ่มต้น
            </button>
          </div>
        </div>

        {leaveTypes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>ยังไม่มีประเภทการลา</h3>
            <p>คลิก "รีเซ็ตเป็นค่าเริ่มต้น" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="leave-types-grid">
            {leaveTypes.map((type) => (
              <div key={type._id} className="leave-type-card">
                <div
                  className="type-header"
                  style={{ background: getTypeColor(type.code) }}
                >
                  <span className="type-icon">{getTypeIcon(type.code)}</span>
                  <h3>{type.name}</h3>
                </div>
                <div className="type-body">
                  <div className="type-stat">
                    <span className="stat-value">{type.defaultDays}</span>
                    <span className="stat-label">วันต่อปี</span>
                  </div>
                  <p className="type-description">
                    {type.description || "ไม่มีคำอธิบาย"}
                  </p>
                  <div className="type-code">รหัส: {type.code}</div>
                </div>
                <div className="type-actions">
                  <button className="edit-btn" onClick={() => openModal(type)}>
                    ✏️ แก้ไข
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>
                {editingType ? "✏️ แก้ไขประเภทการลา" : "➕ เพิ่มประเภทการลา"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>ชื่อประเภท</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="เช่น ลาป่วย"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>รหัส</label>
                    <select
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      disabled={!!editingType}
                    >
                      <option value="sick">sick (ลาป่วย)</option>
                      <option value="personal">personal (ลากิจ)</option>
                      <option value="vacation">vacation (ลาพักร้อน)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>จำนวนวันต่อปี</label>
                    <input
                      type="number"
                      name="defaultDays"
                      value={formData.defaultDays}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>คำอธิบาย</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="คำอธิบายประเภทการลา"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingType ? "บันทึก" : "เพิ่ม"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveTypeManagement;
