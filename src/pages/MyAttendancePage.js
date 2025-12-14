import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './MyAttendancePage.css';

const MyAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/student/attendance');
        setAttendance(response.data || []);
      } catch (err) {
        setError('Yoklama verileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleExcuseRequest = (sessionId) => {
    // Burada mazeret talebi için bir modal veya yönlendirme eklenebilir
    alert('Mazeret talebi özelliği yapım aşamasında.');
  };

  return (
    <div className="my-attendance-page">
      <h2>Yoklama İstatistiklerim</h2>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : attendance.length === 0 ? (
        <div className="no-attendance">Henüz yoklama veriniz yok.</div>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Ders</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>Mazeret</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((item) => (
              <tr key={item.sessionId}>
                <td>{item.courseName}</td>
                <td>{item.date}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === 'absent' && (
                    <button className="excuse-btn" onClick={() => handleExcuseRequest(item.sessionId)}>
                      Mazeret Talep Et
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyAttendancePage;
