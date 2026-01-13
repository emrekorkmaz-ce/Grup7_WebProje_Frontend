import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

const AttendanceAnalyticsPage = () => {
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
      
      const response = await api.get('/analytics/attendance', { params });
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError(t('attendanceAnalytics.errorLoading'));
      console.error('Error fetching attendance analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/analytics/export/attendance?format=excel&${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      alert(t('attendanceAnalytics.exportError'));
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
            <h1>{t('attendanceAnalytics.title')}</h1>
            <button className="btn btn-primary" onClick={handleExport}>
              {t('adminDashboard.downloadAttendanceReport')}
            </button>
          </div>

          {/* Date Filters */}
          <div className="filters-card">
            <h3>{t('attendanceAnalytics.dateFilters')}</h3>
            <div className="filter-inputs">
              <div>
                <label>{t('attendanceAnalytics.startDate')}:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>{t('attendanceAnalytics.endDate')}:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
                {t('attendanceAnalytics.clearFilters')}
              </button>
            </div>
          </div>

          {/* Attendance by Course Chart */}
          <div className="chart-card">
            <h2>{t('attendanceAnalytics.attendanceByCourse')}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.attendanceByCourse?.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="courseCode" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" fill="#8884d8" name={t('attendanceAnalytics.attendanceRate')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trends */}
          <div className="chart-card">
            <h2>{t('attendanceAnalytics.attendanceTrends')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendanceRate" stroke="#8884d8" name={t('attendanceAnalytics.attendanceRate')} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Absence Students */}
          <div className="table-card">
            <h2>{t('attendanceAnalytics.criticalAbsenceStudents')}</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('academicAnalytics.studentNumber')}</th>
                  <th>{t('academicAnalytics.fullName')}</th>
                  <th>{t('academicAnalytics.department')}</th>
                  <th>{t('attendanceAnalytics.attendanceRate')}</th>
                  <th>{t('attendanceAnalytics.totalPresent')}</th>
                  <th>{t('attendanceAnalytics.totalExpected')}</th>
                </tr>
              </thead>
              <tbody>
                {data.criticalAbsenceStudents?.slice(0, 30).map((student, index) => (
                  <tr key={index}>
                    <td>{student.studentNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td className={student.attendanceRate < 50 ? 'risk-value' : ''}>
                      {student.attendanceRate}%
                    </td>
                    <td>{student.totalPresent}</td>
                    <td>{student.totalExpected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Low Attendance Courses */}
          <div className="table-card">
            <h2>{t('attendanceAnalytics.lowAttendanceCourses')}</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('attendanceAnalytics.courseCode')}</th>
                  <th>{t('attendanceAnalytics.courseName')}</th>
                  <th>{t('attendanceAnalytics.attendanceRate')}</th>
                  <th>{t('attendanceAnalytics.totalSessions')}</th>
                  <th>{t('attendanceAnalytics.totalRecords')}</th>
                </tr>
              </thead>
              <tbody>
                {data.lowAttendanceCourses?.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseName}</td>
                    <td className="risk-value">{course.attendanceRate}%</td>
                    <td>{course.totalSessions}</td>
                    <td>{course.totalEnrollments}</td>
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

export default AttendanceAnalyticsPage;

