
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
      await api.post(`/student/excuse-request`, {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', marginLeft: 250 }}>
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
          {/* Mazeret Talep Modalı */}
          {excuseModal.open && (
            <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div className="modal-content" style={{background:'#222',padding:24,borderRadius:8,minWidth:320}}>
                <h3>Mazeret Talep Et</h3>
                <div style={{marginBottom:12}}>
                  <textarea
                    value={excuseReason}
                    onChange={e => setExcuseReason(e.target.value)}
                    placeholder="Mazeret açıklamanızı girin..."
                    rows={4}
                    style={{width:'100%',resize:'vertical',borderRadius:4,padding:8}}
                  />
                </div>
                {excuseError && <div style={{color:'red',marginBottom:8}}>{excuseError}</div>}
                <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button onClick={()=>setExcuseModal({open:false,sessionId:null})} disabled={excuseLoading}>İptal</button>
                  <button onClick={submitExcuse} disabled={excuseLoading || !excuseReason.trim()}>
                    {excuseLoading ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyAttendancePage;
