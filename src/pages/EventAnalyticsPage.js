import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

const EventAnalyticsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/events');
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError(t('eventAnalytics.errorLoading'));
      console.error('Error fetching event analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/analytics/export/event?format=excel', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      alert(t('eventAnalytics.exportError'));
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
            <h1>{t('eventAnalytics.title')}</h1>
            <button className="btn btn-primary" onClick={handleExport}>
              {t('adminDashboard.downloadEventReport')}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>{t('eventAnalytics.averageRegistrationRate')}</h3>
              <div className="summary-value">{data.averageRegistrationRate}%</div>
            </div>
            <div className="summary-card">
              <h3>{t('eventAnalytics.averageCheckInRate')}</h3>
              <div className="summary-value">{data.averageCheckInRate}%</div>
            </div>
          </div>

          {/* Popular Events */}
          <div className="chart-card">
            <h2>{t('eventAnalytics.popularEvents')}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.popularEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registeredCount" fill="#8884d8" name={t('eventAnalytics.registrationCount')} />
                <Bar dataKey="capacity" fill="#82ca9d" name={t('eventAnalytics.capacity')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="chart-card">
            <h2>{t('eventAnalytics.categoryBreakdown')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  dataKey="totalEvents"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.categoryBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Events with Check-ins */}
          <div className="table-card">
            <h2>{t('eventAnalytics.eventsWithCheckIns')}</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('eventAnalytics.event')}</th>
                  <th>{t('eventAnalytics.totalRegistrations')}</th>
                  <th>{t('eventAnalytics.checkedIn')}</th>
                  <th>{t('eventAnalytics.checkInRate')}</th>
                </tr>
              </thead>
              <tbody>
                {data.eventsWithCheckIns?.slice(0, 20).map((event, index) => (
                  <tr key={index}>
                    <td>{event.title}</td>
                    <td>{event.totalRegistrations}</td>
                    <td>{event.checkedIn}</td>
                    <td>{event.checkInRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventAnalyticsPage;

