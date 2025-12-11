import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAdmin, isSupervisor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🎓 ระบบบริหารการลา</h1>
      </div>

      <div className="navbar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          📊 แดชบอร์ด
        </NavLink>
        <NavLink
          to="/leave-request"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          ✍️ ขอลา
        </NavLink>
        <NavLink
          to="/leave-history"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          📋 ประวัติการลา
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          📅 ปฏิทิน
        </NavLink>
        <NavLink
          to="/team-calendar"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          👥 วันลาทีม
        </NavLink>

        {isSupervisor && (
          <NavLink
            to="/approvals"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            ✅ อนุมัติลา
          </NavLink>
        )}

        {isAdmin && (
          <div className="nav-dropdown">
            <span className="nav-link dropdown-toggle">⚙️ จัดการระบบ</span>
            <div className="dropdown-menu">
              <NavLink to="/reports" className="dropdown-item">
                📊 รายงาน
              </NavLink>
              <NavLink to="/users" className="dropdown-item">
                👥 จัดการบุคลากร
              </NavLink>
              <NavLink to="/leave-types" className="dropdown-item">
                📝 ประเภทการลา
              </NavLink>
              <NavLink to="/holidays" className="dropdown-item">
                🎉 วันหยุด
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <div className="navbar-end">
        <NotificationBell />
        <div className="user-info">
          <span className="user-name">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="user-role">
            {user?.role === "admin"
              ? "ผู้ดูแลระบบ"
              : user?.role === "supervisor"
              ? "หัวหน้างาน"
              : "บุคลากร"}
          </span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 ออกจากระบบ
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
