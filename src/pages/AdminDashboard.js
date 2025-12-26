import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
// Charts will be added later if needed
import './AdminDashboard.css';

const AdminDashboard = () => {
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
      setError('Dashboard verileri yüklenemedi.');
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
      alert('Rapor dışa aktarılamadı.');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="admin-dashboard">
            <div className="loading">Yükleniyor...</div>
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
            <div className="error-message">{error || 'Veri yüklenemedi'}</div>
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
          <h1>Admin Dashboard</h1>

          {/* Key Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Toplam Kullanıcı</h3>
              <div className="metric-value">{dashboardData.totalUsers}</div>
            </div>
            <div className="metric-card">
              <h3>Bugün Aktif Kullanıcı</h3>
              <div className="metric-value">{dashboardData.activeUsersToday}</div>
            </div>
            <div className="metric-card">
              <h3>Toplam Ders</h3>
              <div className="metric-value">{dashboardData.totalCourses}</div>
            </div>
            <div className="metric-card">
              <h3>Toplam Kayıt</h3>
              <div className="metric-value">{dashboardData.totalEnrollments}</div>
            </div>
            <div className="metric-card">
              <h3>Yoklama Oranı</h3>
              <div className="metric-value">{dashboardData.attendanceRate}%</div>
            </div>
            <div className="metric-card">
              <h3>Bugün Yemek Rezervasyonu</h3>
              <div className="metric-value">{dashboardData.mealReservationsToday}</div>
            </div>
            <div className="metric-card">
              <h3>Yaklaşan Etkinlikler</h3>
              <div className="metric-value">{dashboardData.upcomingEvents}</div>
            </div>
            <div className="metric-card">
              <h3>Sistem Durumu</h3>
              <div className={`metric-value status-${dashboardData.systemHealth}`}>
                {dashboardData.systemHealth === 'healthy' ? 'Sağlıklı' : 'Sorunlu'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2>Analitik Raporlar</h2>
            <div className="analytics-links">
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/academic')}>
                Akademik Performans
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/attendance')}>
                Yoklama Analitiği
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/meal')}>
                Yemek Kullanım Raporları
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/events')}>
                Etkinlik Raporları
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="card">
            <h2>Rapor Dışa Aktarma</h2>
            <div className="export-buttons">
              <button className="btn btn-secondary" onClick={() => handleExport('academic')}>
                Akademik Raporu İndir
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('attendance')}>
                Yoklama Raporu İndir
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('meal')}>
                Yemek Raporu İndir
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('event')}>
                Etkinlik Raporu İndir
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

