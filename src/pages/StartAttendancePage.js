
import React, { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './StartAttendancePage.css';

const StartAttendancePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleStartAttendance = async () => {
    setLoading(true);
    setError(null);
    setQrCode(null);
    try {
      // TODO: section_id, date, start_time, end_time değerlerini gerçek veriden al
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const payload = {
        section_id: '11111111-aaaa-bbbb-cccc-111111111111', // Gerçek section_id
        date: now.toISOString().slice(0, 10),
        start_time: now.toISOString(),
        end_time: oneHourLater.toISOString(),
        latitude: 0,
        longitude: 0
      };
      console.log('POST PAYLOAD:', payload);
      const response = await api.post('/attendance/sessions', payload);
      setQrCode(response.data.qrCodeUrl || response.data.qr_code || null);
      setSessionId(response.data.id || response.data.sessionId);
    } catch (err) {
      setError('Yoklama başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', marginLeft: 250 }}>
          <div className="start-attendance-page">
            <h2>Yoklama Oturumu Başlat</h2>
            <button className="start-btn" onClick={handleStartAttendance} disabled={loading}>
              {loading ? 'Başlatılıyor...' : 'Yoklama Başlat'}
            </button>
            {error && <div className="error">{error}</div>}
            {qrCode && (
              <div className="qr-section">
                <h3>QR Kod ile Yoklama</h3>
                <img src={qrCode} alt="Yoklama QR Kodu" className="qr-image" />
                <div className="session-id">Oturum Kodu: {sessionId}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StartAttendancePage;
