import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './ExcuseRequestsPage.css';

const ExcuseRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/faculty/excuse-requests');
        setRequests(response.data || []);
      } catch (err) {
        setError('Mazeret talepleri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      await api.post(`/faculty/excuse-requests/${requestId}/${action}`);
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));
    } catch (err) {
      alert('İşlem başarısız.');
    }
  };

  return (
    <div className="excuse-requests-page">
      <h2>Mazeret Talepleri</h2>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : requests.length === 0 ? (
        <div className="no-requests">Mazeret talebi bulunmamaktadır.</div>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Ders</th>
              <th>Tarih</th>
              <th>Açıklama</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.studentName}</td>
                <td>{req.courseName}</td>
                <td>{req.date}</td>
                <td>{req.reason}</td>
                <td>{req.status === 'approved' ? 'Onaylandı' : req.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}</td>
                <td>
                  {req.status === 'pending' && (
                    <>
                      <button className="approve-btn" onClick={() => handleAction(req.id, 'approve')}>Onayla</button>
                      <button className="reject-btn" onClick={() => handleAction(req.id, 'reject')}>Reddet</button>
                    </>
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

export default ExcuseRequestsPage;
