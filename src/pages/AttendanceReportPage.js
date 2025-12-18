
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { DownloadIcon } from '../components/Icons';
// import './AttendanceReportPage.css';

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
        const response = await api.get(`/attendance/report/${sectionId}`);
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
      const response = await api.get(`/attendance/report/${sectionId}/export`, { responseType: 'blob' });
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
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2>Yoklama Raporu</h2>
            <button className="export-btn" onClick={handleExportExcel}>
              <DownloadIcon size={16} /> Excel İndir
            </button>
          </div>

          {loading ? (
            <div className="loading">Veriler yükleniyor...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : report.length === 0 ? (
            <div className="text-center p-4">Henüz kayıt bulunamadı.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Öğrenci No</th>
                    <th>Ad Soyad</th>
                    <th>Katılım</th>
                    <th>Toplam</th>
                    <th>Devamsızlık</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((item) => (
                    <tr key={item.studentId}>
                      <td style={{ fontFamily: 'monospace' }}>{item.studentNumber}</td>
                      <td style={{ fontWeight: 500 }}>{item.fullName}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981'
                        }}>
                          {item.presentCount}
                        </span>
                      </td>
                      <td>{item.totalCount}</td>
                      <td>
                        <div style={{
                          width: '100%',
                          background: '#e2e8f0',
                          height: '6px',
                          borderRadius: '3px',
                          marginTop: '5px',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${Math.min(item.absencePercent, 100)}%`,
                            background: item.absencePercent > 30 ? '#ef4444' : '#10b981',
                            height: '100%',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.8em', color: item.absencePercent > 30 ? '#ef4444' : '#94a3b8' }}>
                          %{item.absencePercent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceReportPage;
