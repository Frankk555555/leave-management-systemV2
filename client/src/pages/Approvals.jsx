import React, { useState, useEffect } from "react";
import { leaveRequestsAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import "./Approvals.css";

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [noteModal, setNoteModal] = useState({
    open: false,
    requestId: null,
    action: null,
  });
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await leaveRequestsAPI.getPending();
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (requestId, action) => {
    setNoteModal({ open: true, requestId, action });
    setNote("");
  };

  const confirmAction = async () => {
    setProcessing(noteModal.requestId);
    try {
      if (noteModal.action === "approve") {
        await leaveRequestsAPI.approve(noteModal.requestId, note);
      } else {
        await leaveRequestsAPI.reject(noteModal.requestId, note);
      }
      setRequests((prev) => prev.filter((r) => r._id !== noteModal.requestId));
    } catch (error) {
      console.error("Error processing request:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setProcessing(null);
      setNoteModal({ open: false, requestId: null, action: null });
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
      <div className="approvals-page">
        <div className="page-header">
          <h1>✅ อนุมัติการลา</h1>
          <p>รายการคำขอลาที่รอการอนุมัติ ({requests.length} รายการ)</p>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <h3>ไม่มีคำขอที่รอการอนุมัติ</h3>
            <p>คำขอลาทั้งหมดได้รับการดำเนินการแล้ว</p>
          </div>
        ) : (
          <div className="approvals-grid">
            {requests.map((request) => (
              <div key={request._id} className="approval-card">
                <div className="card-header">
                  <div className="employee-info">
                    <div className="avatar">
                      {request.employee?.firstName?.charAt(0)}
                    </div>
                    <div>
                      <h4>
                        {request.employee?.firstName}{" "}
                        {request.employee?.lastName}
                      </h4>
                      <p>
                        {request.employee?.department} -{" "}
                        {request.employee?.position}
                      </p>
                    </div>
                  </div>
                  <div className="leave-type-badge">
                    {getLeaveTypeIcon(request.leaveType)}{" "}
                    {getLeaveTypeName(request.leaveType)}
                  </div>
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
                    <div className="days-count">
                      <span className="days-number">{request.totalDays}</span>
                      <span className="days-label">วัน</span>
                    </div>
                  </div>

                  <div className="reason-section">
                    <span className="reason-label">เหตุผล:</span>
                    <p className="reason-text">{request.reason}</p>
                  </div>

                  {request.attachments && request.attachments.length > 0 && (
                    <div className="attachments-section">
                      <span className="attachments-label">
                        📎 มีไฟล์แนบ {request.attachments.length} ไฟล์
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(request._id, "reject")}
                    disabled={processing === request._id}
                  >
                    ❌ ไม่อนุมัติ
                  </button>
                  <button
                    className="approve-btn"
                    onClick={() => handleAction(request._id, "approve")}
                    disabled={processing === request._id}
                  >
                    ✅ อนุมัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {noteModal.open && (
          <div
            className="modal-overlay"
            onClick={() =>
              setNoteModal({ open: false, requestId: null, action: null })
            }
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>
                {noteModal.action === "approve"
                  ? "✅ ยืนยันการอนุมัติ"
                  : "❌ ยืนยันการปฏิเสธ"}
              </h3>
              <div className="form-group">
                <label>หมายเหตุ (ถ้ามี)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ระบุหมายเหตุ..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() =>
                    setNoteModal({ open: false, requestId: null, action: null })
                  }
                >
                  ยกเลิก
                </button>
                <button
                  className={
                    noteModal.action === "approve"
                      ? "approve-btn"
                      : "reject-btn"
                  }
                  onClick={confirmAction}
                  disabled={processing}
                >
                  {processing ? "กำลังดำเนินการ..." : "ยืนยัน"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Approvals;
