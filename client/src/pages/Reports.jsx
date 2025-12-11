import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { reportsAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import "./Reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, [year]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getStatistics(year);
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await reportsAPI.exportExcel(year);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leave-report-${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งออกไฟล์");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await reportsAPI.exportPDF(year);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leave-report-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งออกไฟล์");
    } finally {
      setExporting(false);
    }
  };

  const handleResetYearly = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตวันลาของบุคลากรทุกคน?"))
      return;
    setResetting(true);
    try {
      const response = await reportsAPI.resetYearly();
      alert(
        `${response.data.message}\nอัปเดตแล้ว ${response.data.updatedCount} คน`
      );
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setResetting(false);
    }
  };

  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const monthlyChartData = {
    labels: monthNames,
    datasets: [
      {
        label: "จำนวนวันลา",
        data: statistics?.byMonth || [],
        backgroundColor: "rgba(102, 126, 234, 0.7)",
        borderColor: "rgba(102, 126, 234, 1)",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const typeChartData = {
    labels: ["ลาป่วย", "ลากิจ", "ลาพักร้อน"],
    datasets: [
      {
        data: [
          statistics?.byType?.sick || 0,
          statistics?.byType?.personal || 0,
          statistics?.byType?.vacation || 0,
        ],
        backgroundColor: [
          "rgba(17, 153, 142, 0.8)",
          "rgba(102, 126, 234, 0.8)",
          "rgba(246, 211, 101, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const statusChartData = {
    labels: ["อนุมัติแล้ว", "รออนุมัติ", "ไม่อนุมัติ"],
    datasets: [
      {
        data: [
          statistics?.byStatus?.approved || 0,
          statistics?.byStatus?.pending || 0,
          statistics?.byStatus?.rejected || 0,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
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
      <div className="reports-page">
        <div className="page-header">
          <div>
            <h1>📊 รายงานและสถิติ</h1>
            <p>ภาพรวมการลาของบุคลากรในองค์กร</p>
          </div>
          <div className="header-actions">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="year-select"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    ปี {y + 543}
                  </option>
                );
              })}
            </select>
            <button
              className="export-btn excel"
              onClick={handleExportExcel}
              disabled={exporting}
            >
              📄 Excel
            </button>
            <button
              className="export-btn pdf"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              📕 PDF
            </button>
            <button
              className="reset-btn"
              onClick={handleResetYearly}
              disabled={resetting}
            >
              🔄 รีเซ็ตวันลา
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <div className="stat-info">
              <h3>{statistics?.totalRequests || 0}</h3>
              <p>คำขอลาทั้งหมด</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <h3>{statistics?.totalDays || 0}</h3>
              <p>วันลาทั้งหมด</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <h3>{statistics?.totalEmployees || 0}</h3>
              <p>บุคลากรในระบบ</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <h3>{statistics?.byStatus?.approved || 0}</h3>
              <p>อนุมัติแล้ว</p>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>📈 สถิติการลารายเดือน</h3>
            <div className="chart-container">
              <Bar
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card small">
            <h3>🏥 ประเภทการลา</h3>
            <div className="chart-container doughnut">
              <Doughnut
                data={typeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card small">
            <h3>📋 สถานะคำขอ</h3>
            <div className="chart-container doughnut">
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {statistics?.byDepartment &&
          Object.keys(statistics.byDepartment).length > 0 && (
            <div className="department-table-card">
              <h3>🏢 การลาแยกตามแผนก</h3>
              <table className="department-table">
                <thead>
                  <tr>
                    <th>แผนก</th>
                    <th>จำนวนวันลา</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistics.byDepartment)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dept, days]) => (
                      <tr key={dept}>
                        <td>{dept}</td>
                        <td>{days} วัน</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </>
  );
};

export default Reports;
