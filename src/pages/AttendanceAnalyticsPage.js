import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

const AttendanceAnalyticsPage = () => {
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
      setError('Yoklama analitiği verileri yüklenemedi.');
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
            <h1>Yoklama Analitiği</h1>
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

          {/* Attendance by Course Chart */}
          <div className="chart-card">
            <h2>Derslere Göre Yoklama Oranı</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.attendanceByCourse?.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="courseCode" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" fill="#8884d8" name="Yoklama Oranı (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trends */}
          <div className="chart-card">
            <h2>Yoklama Trendleri (Zaman İçinde)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendanceRate" stroke="#8884d8" name="Yoklama Oranı (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Absence Students */}
          <div className="table-card">
            <h2>Kritik Yoklama Oranına Sahip Öğrenciler (&lt; %70)</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Öğrenci No</th>
                  <th>Ad Soyad</th>
                  <th>Bölüm</th>
                  <th>Yoklama Oranı</th>
                  <th>Toplam Mevcut</th>
                  <th>Toplam Beklenen</th>
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
            <h2>Düşük Yoklama Oranına Sahip Dersler (&lt; %70)</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Ders Kodu</th>
                  <th>Ders Adı</th>
                  <th>Yoklama Oranı</th>
                  <th>Toplam Oturum</th>
                  <th>Toplam Kayıt</th>
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

