import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

const AcademicAnalyticsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/academic-performance');
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError(t('academicAnalytics.errorLoading'));
      console.error('Error fetching academic analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/analytics/export/academic?format=excel', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'academic_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      alert(t('academicAnalytics.exportError'));
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  const gradeData = data.gradeDistribution || [];
  const departmentData = data.averageGpaByDepartment || [];

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="analytics-page">
          <div className="analytics-header">
            <h1>{t('academicAnalytics.title')}</h1>
            <button className="btn btn-primary" onClick={handleExport}>
              {t('adminDashboard.downloadAcademicReport')}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <h3>{t('academicAnalytics.overallAverageGPA') || 'Overall Average GPA'}</h3>
              <div className="summary-value">{data.overallAverageGPA || '-'}</div>
            </div>
            <div className="summary-card">
              <h3>{t('academicAnalytics.overallAverageCGPA') || 'Overall Average CGPA'}</h3>
              <div className="summary-value">{data.overallAverageCGPA || '-'}</div>
            </div>
            <div className="summary-card">
              <h3>{t('academicAnalytics.passRate')}</h3>
              <div className="summary-value">{data.passRate}%</div>
            </div>
            <div className="summary-card">
              <h3>{t('academicAnalytics.failRate')}</h3>
              <div className="summary-value">{data.failRate}%</div>
            </div>
          </div>

          {/* Grade Distribution Chart */}
          <div className="chart-card">
            <h2>{t('academicAnalytics.gradeDistribution')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name={t('academicAnalytics.studentCount')} />
                <Bar dataKey="percentage" fill="#82ca9d" name={t('academicAnalytics.percentage')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average GPA by Department */}
          <div className="chart-card">
            <h2>{t('academicAnalytics.averageGpaByDepartment')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departmentName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageGPA" fill="#0088FE" name={t('academicAnalytics.averageGPA')} />
                <Bar dataKey="averageCGPA" fill="#00C49F" name={t('academicAnalytics.averageCGPA') || 'Average CGPA'} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performing Students */}
          <div className="table-card">
            <h2>{t('academicAnalytics.topPerformingStudents')}</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('academicAnalytics.studentNumber')}</th>
                  <th>{t('academicAnalytics.fullName')}</th>
                  <th>{t('academicAnalytics.department')}</th>
                  <th>{t('academicAnalytics.gpa')}</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformingStudents?.slice(0, 10).map((student, index) => (
                  <tr key={index}>
                    <td>{student.studentNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td>{student.gpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* At-Risk Students */}
          <div className="table-card">
            <h2>{t('academicAnalytics.atRiskStudents')}</h2>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>{t('academicAnalytics.studentNumber')}</th>
                  <th>{t('academicAnalytics.fullName')}</th>
                  <th>{t('academicAnalytics.department')}</th>
                  <th>{t('academicAnalytics.gpa')}</th>
                </tr>
              </thead>
              <tbody>
                {data.atRiskStudents?.slice(0, 20).map((student, index) => (
                  <tr key={index}>
                    <td>{student.studentNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td className="risk-value">{student.gpa.toFixed(2)}</td>
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

export default AcademicAnalyticsPage;

