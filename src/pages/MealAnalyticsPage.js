import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

const MealAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/analytics/meal-usage', { params });
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError('Yemek kullanım verileri yüklenemedi.');
      console.error('Error fetching meal analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/analytics/export/meal?format=excel&${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'meal_report.xlsx');
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
          <div className="analytics-page">
            <div className="loading">Yükleniyor...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="analytics-page">
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
        <div className="analytics-page">
          <div className="analytics-header">
            <h1>Yemek Kullanım Analitiği</h1>
            <button className="btn btn-primary" onClick={handleExport}>
              Raporu İndir (Excel)
            </button>
          </div>

          {/* Date Filters */}
          <div className="filters-card">
            <h3>Tarih Filtreleri</h3>
            <div className="filter-inputs">
              <div>
                <label>Başlangıç Tarihi:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>Bitiş Tarihi:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Toplam Gelir</h3>
              <div className="summary-value">{data.totalRevenue?.toFixed(2)} ₺</div>
            </div>
          </div>

          {/* Daily Meal Counts */}
          <div className="chart-card">
            <h2>Günlük Yemek Sayıları</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyMealCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="breakfast" stroke="#8884d8" name="Kahvaltı" />
                <Line type="monotone" dataKey="lunch" stroke="#82ca9d" name="Öğle Yemeği" />
                <Line type="monotone" dataKey="dinner" stroke="#ffc658" name="Akşam Yemeği" />
                <Line type="monotone" dataKey="total" stroke="#ff7300" name="Toplam" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cafeteria Utilization */}
          <div className="chart-card">
            <h2>Kafeterya Kullanım Oranları</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cafeteriaUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilizationRate" fill="#8884d8" name="Kullanım Oranı (%)" />
                <Bar dataKey="totalReservations" fill="#82ca9d" name="Toplam Rezervasyon" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours */}
          <div className="chart-card">
            <h2>Yoğun Saatler</h2>
            <div className="peak-hours-grid">
              {data.peakHours?.map((peak, index) => (
                <div key={index} className="peak-hour-card">
                  <h3>{peak.mealType === 'breakfast' ? 'Kahvaltı' : peak.mealType === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'}</h3>
                  <div className="peak-hour-value">
                    {peak.peakHour !== null ? `${peak.peakHour}:00` : 'Veri yok'}
                  </div>
                  <div className="peak-hour-count">En yüksek: {peak.peakCount} rezervasyon</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MealAnalyticsPage;

