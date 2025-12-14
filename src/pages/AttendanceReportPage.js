import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './AttendanceReportPage.css';

const AttendanceReportPage = () => {
  const { sectionId } = useParams();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/faculty/attendance/report/${sectionId}`);
        setReport(response.data || []);
      } catch (err) {
        setError('Yoklama raporu yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sectionId]);

  const handleExportExcel = async () => {
    try {
      const response = await api.get(`/faculty/attendance/report/${sectionId}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'yoklama_raporu.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Excel dışa aktarılamadı.');
    }
  };

  return (
    <div className="attendance-report-page">
      <h2>Yoklama Raporu</h2>
      <button className="export-btn" onClick={handleExportExcel}>Excel Olarak Dışa Aktar</button>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : report.length === 0 ? (
        <div className="no-report">Henüz yoklama verisi yok.</div>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Öğrenci No</th>
              <th>Ad Soyad</th>
              <th>Toplam Devam</th>
              <th>Toplam Yoklama</th>
              <th>Devamsızlık (%)</th>
            </tr>
          </thead>
          <tbody>
            {report.map((item) => (
              <tr key={item.studentId}>
                <td>{item.studentNumber}</td>
                <td>{item.fullName}</td>
                <td>{item.presentCount}</td>
                <td>{item.totalCount}</td>
                <td>{item.absencePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceReportPage;
