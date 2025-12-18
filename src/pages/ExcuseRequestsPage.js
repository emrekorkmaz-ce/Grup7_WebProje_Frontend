import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

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
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Mazeret Talepleri</h2>
          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>Mazeret talebi bulunmamaktadır.</div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Öğrenci</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Ders</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Tarih</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Açıklama</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Durum</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{req.studentName}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{req.courseName}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{req.date}</td>
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>{req.reason}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          background: req.status === 'approved' ? 'rgba(16,185,129,0.1)' : req.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: req.status === 'approved' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#f59e0b'
                        }}>
                          {req.status === 'approved' ? 'Onaylandı' : req.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {req.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleAction(req.id, 'approve')}>Onayla</button>
                            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleAction(req.id, 'reject')}>Reddet</button>
                          </div>
                        )}
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

export default ExcuseRequestsPage;
