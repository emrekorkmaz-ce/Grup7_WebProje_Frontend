
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
// // import './MyAttendancePage.css'; // Removed


const MyAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [attRes, sumRes] = await Promise.all([
          api.get('/student/attendance'),
          api.get('/student/attendance-summary')
        ]);
        setAttendance(attRes.data || []);
        setSummary(sumRes.data || []);
      } catch (err) {
        setError('Yoklama verileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [excuseModal, setExcuseModal] = useState({ open: false, sessionId: null });
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseLoading, setExcuseLoading] = useState(false);
  const [excuseError, setExcuseError] = useState(null);

  const handleExcuseRequest = (sessionId) => {
    setExcuseModal({ open: true, sessionId });
    setExcuseReason('');
    setExcuseError(null);
  };

  const submitExcuse = async () => {
    setExcuseLoading(true);
    setExcuseError(null);
    try {
      await api.post(`/ student / excuse - request`, {
        sessionId: excuseModal.sessionId,
        reason: excuseReason
      });
      setExcuseModal({ open: false, sessionId: null });
      setExcuseReason('');
      alert('Mazeret talebiniz iletildi.');
    } catch (err) {
      setExcuseError('Mazeret talebi gönderilemedi.');
    } finally {
      setExcuseLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        {/* ÖZET KARTLARI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {loading ? (
            <div style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</div>
          ) : summary.map(item => (
            <div key={item.courseCode} className="card" style={{ padding: '1.5rem', borderLeft: item.remaining === 0 ? '4px solid #ef4444' : item.remaining <= 1 ? '4px solid #f59e0b' : '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{item.courseName}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>{item.courseCode}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: item.remaining === 0 ? '#ef4444' : 'var(--text-primary)' }}>{item.remaining}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Kalan Hak</p>
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Devamsızlık: <b style={{ color: 'var(--text-primary)' }}>{item.absent}</b> / {item.limit}</span>
                <span>Toplam Ders: {item.totalSessions}</span>
              </div>

              <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (item.absent / item.limit) * 100)}% `,
                  background: item.remaining === 0 ? '#ef4444' : item.remaining <= 1 ? '#f59e0b' : '#3b82f6',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Yoklama Geçmişi</h2>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
          ) : error ? (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px' }}>{error}</div>
          ) : attendance.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              Henüz yoklama veriniz yok.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ders</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tarih</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Durum</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mazeret</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{item.courseName}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          background: item.status === 'present' ? 'rgba(16,185,129,0.1)' : item.status === 'flagged' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: item.status === 'present' ? '#10b981' : item.status === 'flagged' ? '#f59e0b' : '#ef4444'
                        }}>
                          {item.status === 'present' ? 'Katıldı' : item.status === 'flagged' ? 'Şüpheli' : 'Katılmadı'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {/* Mazeret butonu logic'i karmaşık, şimdilik sadece gösterim yaptık */}
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mazeret Talep Modalı */}
          {excuseModal.open && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1100,
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>Mazeret Talep Et</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <textarea
                    value={excuseReason}
                    onChange={e => setExcuseReason(e.target.value)}
                    placeholder="Mazeret açıklamanızı ve rapor detaylarını buraya giriniz..."
                    rows={4}
                    style={{
                      width: '100%',
                      resize: 'vertical',
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      lineHeight: 1.5
                    }}
                  />
                </div>
                {excuseError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{excuseError}</div>}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setExcuseModal({ open: false, sessionId: null })}
                    disabled={excuseLoading}
                    className="btn btn-secondary"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    İptal
                  </button>
                  <button
                    onClick={submitExcuse}
                    disabled={excuseLoading || !excuseReason.trim()}
                    className="btn btn-primary"
                  >
                    {excuseLoading ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyAttendancePage;
