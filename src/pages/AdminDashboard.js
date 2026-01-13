import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
// Charts will be added later if needed
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError(t('adminDashboard.errorLoading'));
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/analytics/export/${type}?format=excel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      alert(t('adminDashboard.exportError'));
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="admin-dashboard">
            <div className="loading">{t('common.loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="admin-dashboard">
            <div className="error-message">{error || t('adminDashboard.errorLoadingData')}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="admin-dashboard">
          <h1>{t('adminDashboard.title')}</h1>

          {/* Key Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>{t('adminDashboard.totalUsers')}</h3>
              <div className="metric-value">{dashboardData.totalUsers}</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.activeUsersToday')}</h3>
              <div className="metric-value">{dashboardData.activeUsersToday}</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.totalCourses')}</h3>
              <div className="metric-value">{dashboardData.totalCourses}</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.totalEnrollments')}</h3>
              <div className="metric-value">{dashboardData.totalEnrollments}</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.attendanceRate')}</h3>
              <div className="metric-value">{dashboardData.attendanceRate}%</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.mealReservationsToday')}</h3>
              <div className="metric-value">{dashboardData.mealReservationsToday}</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.upcomingEvents')}</h3>
              <div className="metric-value">{dashboardData.upcomingEvents}</div>
            </div>
            <div className="metric-card">
              <h3>{t('adminDashboard.systemStatus')}</h3>
              <div className={`metric-value status-${dashboardData.systemHealth}`}>
                {dashboardData.systemHealth === 'healthy' ? t('adminDashboard.healthy') : t('adminDashboard.unhealthy')}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2>{t('adminDashboard.analyticsReports')}</h2>
            <div className="analytics-links">
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/academic')}>
                {t('adminDashboard.academicPerformance')}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/attendance')}>
                {t('adminDashboard.attendanceAnalytics')}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/meal')}>
                {t('adminDashboard.mealUsageReports')}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/events')}>
                {t('adminDashboard.eventReports')}
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="card">
            <h2>{t('adminDashboard.exportReports')}</h2>
            <div className="export-buttons">
              <button className="btn btn-secondary" onClick={() => handleExport('academic')}>
                {t('adminDashboard.downloadAcademicReport')}
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('attendance')}>
                {t('adminDashboard.downloadAttendanceReport')}
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('meal')}>
                {t('adminDashboard.downloadMealReport')}
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('event')}>
                {t('adminDashboard.downloadEventReport')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

