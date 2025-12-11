import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leaveRequestsAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import "./Dashboard.css";
import React from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await leaveRequestsAPI.getMyRequests();
      const requests = response.data;

      setStats({
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
        total: requests.length,
      });

      setRecentRequests(requests.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeName = (type) => {
    const types = { sick: "ลาป่วย", personal: "ลากิจ", vacation: "ลาพักร้อน" };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", color: "#d97706", text: "รออนุมัติ" },
      approved: { bg: "#d1fae5", color: "#059669", text: "อนุมัติแล้ว" },
      rejected: { bg: "#fee2e2", color: "#dc2626", text: "ไม่อนุมัติ" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          padding: "0.25rem 0.75rem",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: 500,
        }}
      >
        {style.text}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
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
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>สวัสดี, {user?.firstName}! 👋</h1>
          <p>ยินดีต้อนรับเข้าสู่ระบบบริหารการลา</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
              }}
            >
              📊
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>คำขอทั้งหมด</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #f6d365, #fda085)",
              }}
            >
              ⏳
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>รออนุมัติ</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #11998e, #38ef7d)",
              }}
            >
              ✅
            </div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>อนุมัติแล้ว</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a5a)",
              }}
            >
              ❌
            </div>
            <div className="stat-info">
              <h3>{stats.rejected}</h3>
              <p>ไม่อนุมัติ</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="leave-balance-card">
            <h2>🎯 ยอดวันลาคงเหลือ</h2>
            <div className="balance-grid">
              <div className="balance-item">
                <div className="balance-icon">🏥</div>
                <div className="balance-info">
                  <h4>ลาป่วย</h4>
                  <p>
                    <span className="balance-number">
                      {user?.leaveBalance?.sick || 0}
                    </span>{" "}
                    วัน
                  </p>
                </div>
                <div className="balance-bar">
                  <div
                    className="balance-progress"
                    style={{
                      width: `${((user?.leaveBalance?.sick || 0) / 30) * 100}%`,
                      background: "linear-gradient(90deg, #11998e, #38ef7d)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="balance-item">
                <div className="balance-icon">📋</div>
                <div className="balance-info">
                  <h4>ลากิจ</h4>
                  <p>
                    <span className="balance-number">
                      {user?.leaveBalance?.personal || 0}
                    </span>{" "}
                    วัน
                  </p>
                </div>
                <div className="balance-bar">
                  <div
                    className="balance-progress"
                    style={{
                      width: `${
                        ((user?.leaveBalance?.personal || 0) / 10) * 100
                      }%`,
                      background: "linear-gradient(90deg, #667eea, #764ba2)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="balance-item">
                <div className="balance-icon">🏖️</div>
                <div className="balance-info">
                  <h4>ลาพักร้อน</h4>
                  <p>
                    <span className="balance-number">
                      {user?.leaveBalance?.vacation || 0}
                    </span>{" "}
                    วัน
                  </p>
                </div>
                <div className="balance-bar">
                  <div
                    className="balance-progress"
                    style={{
                      width: `${
                        ((user?.leaveBalance?.vacation || 0) / 10) * 100
                      }%`,
                      background: "linear-gradient(90deg, #f6d365, #fda085)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-requests-card">
            <h2>📋 คำขอล่าสุด</h2>
            {recentRequests.length === 0 ? (
              <p className="no-data">ยังไม่มีคำขอลา</p>
            ) : (
              <div className="requests-list">
                {recentRequests.map((request) => (
                  <div key={request._id} className="request-item">
                    <div className="request-type">
                      {request.leaveType === "sick"
                        ? "🏥"
                        : request.leaveType === "personal"
                        ? "📋"
                        : "🏖️"}
                    </div>
                    <div className="request-info">
                      <h4>{getLeaveTypeName(request.leaveType)}</h4>
                      <p>
                        {formatDate(request.startDate)} -{" "}
                        {formatDate(request.endDate)}
                      </p>
                    </div>
                    <div className="request-days">{request.totalDays} วัน</div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
