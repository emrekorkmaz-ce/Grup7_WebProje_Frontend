import React, { useEffect, useState } from 'react';
import api from '../services/api';
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
      const response = await api.post('/faculty/attendance/start');
      setQrCode(response.data.qrCodeUrl);
      setSessionId(response.data.sessionId);
    } catch (err) {
      setError('Yoklama başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default StartAttendancePage;
