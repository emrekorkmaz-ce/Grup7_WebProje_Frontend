import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

const MealAnalyticsPage = () => {
  const { t } = useTranslation();
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
      setError(t('mealAnalytics.errorLoading'));
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
      alert(t('mealAnalytics.exportError'));
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="analytics-page">
            <div className="loading">{t('common.loading')}</div>
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
            <div className="error-message">{error || t('common.noData')}</div>
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
            <h1>{t('mealAnalytics.title')}</h1>
            <button className="btn btn-primary" onClick={handleExport}>
              {t('adminDashboard.downloadMealReport')}
            </button>
          </div>

          {/* Date Filters */}
          <div className="filters-card">
            <h3>{t('mealAnalytics.dateFilters')}</h3>
            <div className="filter-inputs">
              <div>
                <label>{t('mealAnalytics.startDate')}:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>{t('mealAnalytics.endDate')}:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
                {t('mealAnalytics.clearFilters')}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>{t('mealAnalytics.totalRevenue')}</h3>
              <div className="summary-value">{data.totalRevenue?.toFixed(2)} ₺</div>
            </div>
          </div>

          {/* Daily Meal Counts */}
          <div className="chart-card">
            <h2>{t('mealAnalytics.dailyMealCounts')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyMealCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="breakfast" stroke="#8884d8" name={t('mealAnalytics.breakfast')} />
                <Line type="monotone" dataKey="lunch" stroke="#82ca9d" name={t('mealAnalytics.lunch')} />
                <Line type="monotone" dataKey="dinner" stroke="#ffc658" name={t('mealAnalytics.dinner')} />
                <Line type="monotone" dataKey="total" stroke="#ff7300" name={t('mealAnalytics.total')} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cafeteria Utilization */}
          <div className="chart-card">
            <h2>{t('mealAnalytics.cafeteriaUtilization')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cafeteriaUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilizationRate" fill="#8884d8" name={t('mealAnalytics.utilizationRate')} />
                <Bar dataKey="totalReservations" fill="#82ca9d" name={t('mealAnalytics.totalReservations')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours */}
          <div className="chart-card">
            <h2>{t('mealAnalytics.peakHours')}</h2>
            <div className="peak-hours-grid">
              {data.peakHours?.map((peak, index) => (
                <div key={index} className="peak-hour-card">
                  <h3>{peak.mealType === 'breakfast' ? t('mealAnalytics.breakfast') : peak.mealType === 'lunch' ? t('mealAnalytics.lunch') : t('mealAnalytics.dinner')}</h3>
                  <div className="peak-hour-value">
                    {peak.peakHour !== null ? `${peak.peakHour}:00` : t('common.noData')}
                  </div>
                  <div className="peak-hour-count">{t('mealAnalytics.peakCount').replace('{count}', peak.peakCount)}</div>
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

