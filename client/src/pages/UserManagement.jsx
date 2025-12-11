import React, { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "",
    position: "",
    role: "employee",
    supervisor: "",
    leaveBalance: { sick: 30, personal: 10, vacation: 10 },
  });

  useEffect(() => {
    fetchUsers();
    fetchSupervisors();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await usersAPI.getSupervisors();
      setSupervisors(response.data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("leaveBalance.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        leaveBalance: { ...prev.leaveBalance, [field]: parseInt(value) || 0 },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        department: user.department,
        position: user.position,
        role: user.role,
        supervisor: user.supervisor?._id || "",
        leaveBalance: user.leaveBalance || {
          sick: 30,
          personal: 10,
          vacation: 10,
        },
      });
    } else {
      setEditingUser(null);
      setFormData({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        department: "",
        position: "",
        role: "employee",
        supervisor: "",
        leaveBalance: { sick: 30, personal: 10, vacation: 10 },
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;
      if (!dataToSend.supervisor) dataToSend.supervisor = null;

      if (editingUser) {
        await usersAPI.update(editingUser._id, dataToSend);
      } else {
        await usersAPI.create(dataToSend);
      }
      fetchUsers();
      setModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบบุคลากรนี้หรือไม่?")) return;
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const getRoleName = (role) => {
    const roles = {
      admin: "ผู้ดูแลระบบ",
      supervisor: "หัวหน้างาน",
      employee: "บุคลากร",
    };
    return roles[role] || role;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: {
        bg: "linear-gradient(135deg, #ff6b6b, #ee5a5a)",
        color: "white",
      },
      supervisor: {
        bg: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white",
      },
      employee: { bg: "#e2e8f0", color: "#4a5568" },
    };
    const style = styles[role] || styles.employee;
    return (
      <span
        className="role-badge"
        style={{ background: style.bg, color: style.color }}
      >
        {getRoleName(role)}
      </span>
    );
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
      <div className="user-management-page">
        <div className="page-header">
          <div>
            <h1>👥 จัดการบุคลากร</h1>
            <p>จัดการข้อมูลบุคลากรในระบบ ({users.length} คน)</p>
          </div>
          <button className="add-btn" onClick={() => openModal()}>
            ➕ เพิ่มบุคลากร
          </button>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>แผนก</th>
                <th>ตำแหน่ง</th>
                <th>บทบาท</th>
                <th>วันลาคงเหลือ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.employeeId}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.firstName?.charAt(0)}
                      </div>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.department}</td>
                  <td>{user.position}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <div className="leave-balance-cell">
                      <span title="ลาป่วย">
                        🏥 {user.leaveBalance?.sick || 0}
                      </span>
                      <span title="ลากิจ">
                        📋 {user.leaveBalance?.personal || 0}
                      </span>
                      <span title="ลาพักร้อน">
                        🏖️ {user.leaveBalance?.vacation || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="edit-btn"
                        onClick={() => openModal(user)}
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div
              className="modal-content user-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{editingUser ? "✏️ แก้ไขบุคลากร" : "➕ เพิ่มบุคลากร"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>รหัสพนักงาน</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div className="form-group">
                    <label>อีเมล</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>ชื่อ</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>นามสกุล</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>แผนก/ภาควิชา</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ตำแหน่ง</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>บทบาท</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="employee">บุคลากร</option>
                      <option value="supervisor">หัวหน้างาน</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>หัวหน้างาน</label>
                    <select
                      name="supervisor"
                      value={formData.supervisor}
                      onChange={handleChange}
                    >
                      <option value="">-- ไม่มี --</option>
                      {supervisors.map((sup) => (
                        <option key={sup._id} value={sup._id}>
                          {sup.firstName} {sup.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label>รหัสผ่าน</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                )}

                <div className="form-section-title">วันลาคงเหลือ</div>
                <div className="form-row three-cols">
                  <div className="form-group">
                    <label>🏥 ลาป่วย</label>
                    <input
                      type="number"
                      name="leaveBalance.sick"
                      value={formData.leaveBalance.sick}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label>📋 ลากิจ</label>
                    <input
                      type="number"
                      name="leaveBalance.personal"
                      value={formData.leaveBalance.personal}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label>🏖️ ลาพักร้อน</label>
                    <input
                      type="number"
                      name="leaveBalance.vacation"
                      value={formData.leaveBalance.vacation}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
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
                    {editingUser ? "บันทึก" : "เพิ่ม"}
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

export default UserManagement;
