import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import React from "react";

const ProtectedRoute = ({
  children,
  adminOnly = false,
  supervisorOnly = false,
}) => {
  const { isAuthenticated, loading, isAdmin, isSupervisor } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (supervisorOnly && !isSupervisor) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
