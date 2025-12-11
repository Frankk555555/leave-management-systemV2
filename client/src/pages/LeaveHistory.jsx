import React, { useState, useEffect } from "react";
import { leaveRequestsAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import "./LeaveHistory.css";

const LeaveHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editModal, setEditModal] = useState({ open: false, request: null });
  const [editForm, setEditForm] = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await leaveRequestsAPI.getMyRequests();
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("คุณต้องการยกเลิกคำขอลานี้หรือไม่?")) return;
    try {
      await leaveRequestsAPI.cancel(id);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "cancelled" } : r))
      );
      alert("ยกเลิกคำขอลาเรียบร้อยแล้ว");
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const openEditModal = (request) => {
    setEditForm({
      leaveType: request.leaveType,
      startDate: new Date(request.startDate).toISOString().split("T")[0],
      endDate: new Date(request.endDate).toISOString().split("T")[0],
      reason: request.reason,
    });
    setEditModal({ open: true, request });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await leaveRequestsAPI.update(editModal.request._id, editForm);
      fetchRequests();
      setEditModal({ open: false, request: null });
      alert("อัปเดตคำขอลาเรียบร้อยแล้ว");
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setProcessing(false);
    }
  };

  const getLeaveTypeName = (type) => {
    const types = { sick: "ลาป่วย", personal: "ลากิจ", vacation: "ลาพักร้อน" };
    return types[type] || type;
  };

  const getLeaveTypeIcon = (type) => {
    const icons = { sick: "🏥", personal: "📋", vacation: "🏖️" };
    return icons[type] || "📝";
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
        color: "#d97706",
        text: "รออนุมัติ",
        icon: "⏳",
      },
      approved: {
        bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        color: "#059669",
        text: "อนุมัติแล้ว",
        icon: "✅",
      },
      rejected: {
        bg: "linear-gradient(135deg, #fee2e2, #fecaca)",
        color: "#dc2626",
        text: "ไม่อนุมัติ",
        icon: "❌",
      },
      cancelled: {
        bg: "linear-gradient(135deg, #e2e8f0, #cbd5e0)",
        color: "#718096",
        text: "ยกเลิกแล้ว",
        icon: "🚫",
      },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        className="status-badge"
        style={{ background: style.bg, color: style.color }}
      >
        {style.icon} {style.text}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

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
      <div className="leave-history-page">
        <div className="page-header">
          <div>
            <h1>📋 ประวัติการลา</h1>
            <p>รายการคำขอลาทั้งหมดของคุณ</p>
          </div>
          <div className="filter-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              ทั้งหมด ({requests.length})
            </button>
            <button
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              รออนุมัติ ({requests.filter((r) => r.status === "pending").length}
              )
            </button>
            <button
              className={filter === "approved" ? "active" : ""}
              onClick={() => setFilter("approved")}
            >
              อนุมัติแล้ว (
              {requests.filter((r) => r.status === "approved").length})
            </button>
            <button
              className={filter === "rejected" ? "active" : ""}
              onClick={() => setFilter("rejected")}
            >
              ไม่อนุมัติ (
              {requests.filter((r) => r.status === "rejected").length})
            </button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>ไม่มีข้อมูลการลา</h3>
            <p>ยังไม่มีคำขอลาในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="history-grid">
            {filteredRequests.map((request) => (
              <div key={request._id} className="history-card">
                <div className="card-header">
                  <div className="leave-type-info">
                    <span className="type-icon">
                      {getLeaveTypeIcon(request.leaveType)}
                    </span>
                    <span className="type-name">
                      {getLeaveTypeName(request.leaveType)}
                    </span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="card-body">
                  <div className="date-range-display">
                    <div className="date-item">
                      <span className="date-label">เริ่มต้น</span>
                      <span className="date-value">
                        {formatDate(request.startDate)}
                      </span>
                    </div>
                    <div className="date-arrow">→</div>
                    <div className="date-item">
                      <span className="date-label">สิ้นสุด</span>
                      <span className="date-value">
                        {formatDate(request.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="days-badge">{request.totalDays} วัน</div>

                  <div className="reason-section">
                    <span className="reason-label">เหตุผล:</span>
                    <p className="reason-text">{request.reason}</p>
                  </div>

                  {request.attachments && request.attachments.length > 0 && (
                    <div className="attachments-section">
                      <span className="attachments-label">
                        📎 ไฟล์แนบ ({request.attachments.length})
                      </span>
                    </div>
                  )}

                  {request.approvalNote && (
                    <div className="approval-note">
                      <span className="note-label">หมายเหตุผู้อนุมัติ:</span>
                      <p className="note-text">{request.approvalNote}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <span className="created-date">
                    ยื่นเมื่อ {formatDate(request.createdAt)}
                  </span>
                  {request.status === "pending" && (
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(request)}
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(request._id)}
                      >
                        ❌ ยกเลิก
                      </button>
                    </div>
                  )}
                  {request.approvedBy && (
                    <span className="approver">
                      โดย {request.approvedBy.firstName}{" "}
                      {request.approvedBy.lastName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {editModal.open && (
          <div
            className="modal-overlay"
            onClick={() => setEditModal({ open: false, request: null })}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>✏️ แก้ไขคำขอลา</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>ประเภทการลา</label>
                  <select
                    value={editForm.leaveType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, leaveType: e.target.value })
                    }
                  >
                    <option value="sick">🏥 ลาป่วย</option>
                    <option value="personal">📋 ลากิจ</option>
                    <option value="vacation">🏖️ ลาพักร้อน</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>วันที่เริ่มต้น</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                      min={editForm.startDate}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>เหตุผล</label>
                  <textarea
                    value={editForm.reason}
                    onChange={(e) =>
                      setEditForm({ ...editForm, reason: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditModal({ open: false, request: null })}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={processing}
                  >
                    {processing ? "กำลังบันทึก..." : "บันทึก"}
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

export default LeaveHistory;
