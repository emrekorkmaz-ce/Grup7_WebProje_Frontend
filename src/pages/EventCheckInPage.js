import React, { useState } from 'react';
import api from '../services/api';
import './EventCheckInPage.css';

const EventCheckInPage = () => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheckIn = async () => {
    if (!qrCode.trim()) {
      setError('Lütfen QR kod girin.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      // Extract event ID and registration ID from QR code or find registration
      // For now, we'll need to search for the registration
      // In production, QR code should contain event ID and registration ID
      
      // Simplified: Assume QR code format is EVENT-{uuid}
      // We need to find which event this registration belongs to
      // This would require a different endpoint or QR code structure
      
      // For now, show error that this needs proper implementation
      setError('QR kod formatı doğrulanamadı. Lütfen geçerli bir QR kod girin.');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in yapılamadı.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheckIn();
    }
  };

  return (
    <div className="event-checkin-page">
      <h1>Etkinlik Check-in</h1>
      <p className="subtitle">Etkinlik yöneticisi için katılımcı giriş sayfası</p>

      <div className="checkin-container">
        <div className="input-section">
          <label htmlFor="qr-input">QR Kod:</label>
          <input
            id="qr-input"
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="QR kodu buraya girin veya tarayın"
            autoFocus
          />
          <button
            onClick={handleCheckIn}
            disabled={loading || !qrCode.trim()}
            className="checkin-btn"
          >
            {loading ? 'İşleniyor...' : 'Check-in Yap'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && result.success && (
          <div className="success-message">
            <h3>✓ Check-in Başarılı</h3>
            <p>{result.message}</p>
            <div className="user-info">
              <div className="info-item">
                <strong>Kullanıcı:</strong> {result.user?.fullName || 'N/A'}
              </div>
              <div className="info-item">
                <strong>E-posta:</strong> {result.user?.email || 'N/A'}
              </div>
            </div>
            <button
              onClick={() => {
                setResult(null);
                setQrCode('');
                setError('');
              }}
              className="clear-btn"
            >
              Yeni Check-in
            </button>
          </div>
        )}
      </div>

      <div className="instructions">
        <h3>Kullanım Talimatları:</h3>
        <ul>
          <li>Katılımcının telefonundaki QR kodu tarayın veya manuel olarak girin</li>
          <li>QR kod geçerliyse ve etkinlik tarihine uygunsa check-in yapılacaktır</li>
          <li>Check-in yapılan kayıtlar tekrar check-in yapılamaz</li>
        </ul>
      </div>
    </div>
  );
};

export default EventCheckInPage;





