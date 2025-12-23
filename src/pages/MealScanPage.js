import React, { useState } from 'react';
import api from '../services/api';
import './MealScanPage.css';

const MealScanPage = () => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Lütfen QR kod girin.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      // Find reservation by QR code
      const reservationsResponse = await api.get('/meals/reservations/my-reservations');
      const reservations = reservationsResponse.data.data || [];
      
      const reservation = reservations.find(r => r.qr_code === qrCode);

      if (!reservation) {
        setError('Geçersiz QR kod.');
        return;
      }

      if (reservation.status === 'used') {
        setError('Bu rezervasyon zaten kullanılmış.');
        return;
      }

      // Use reservation
      const response = await api.post(`/meals/reservations/${reservation.id}/use`, {
        qr_code: qrCode
      });

      setResult({
        success: true,
        reservation: response.data.data,
        message: 'Yemek başarıyla kullanıldı.'
      });
      setQrCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'QR kod işlenemedi.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="meal-scan-page">
      <h1>QR Kod Tarayıcı</h1>
      <p className="subtitle">Kafeterya personeli için yemek rezervasyonu kullanım sayfası</p>

      <div className="scan-container">
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
            onClick={handleScan}
            disabled={loading || !qrCode.trim()}
            className="scan-btn"
          >
            {loading ? 'İşleniyor...' : 'Tara ve Kullan'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && result.success && (
          <div className="success-message">
            <h3>✓ Başarılı</h3>
            <p>{result.message}</p>
            <div className="reservation-info">
              <div className="info-item">
                <strong>Kullanıcı:</strong> {result.reservation.user?.fullName || 'N/A'}
              </div>
              <div className="info-item">
                <strong>E-posta:</strong> {result.reservation.user?.email || 'N/A'}
              </div>
              <div className="info-item">
                <strong>Öğün:</strong>{' '}
                {result.reservation.meal_type === 'lunch' ? 'Öğle Yemeği' :
                 result.reservation.meal_type === 'dinner' ? 'Akşam Yemeği' : 'Kahvaltı'}
              </div>
              <div className="info-item">
                <strong>Tarih:</strong>{' '}
                {new Date(result.reservation.date).toLocaleDateString('tr-TR')}
              </div>
              <div className="info-item">
                <strong>Kafeterya:</strong> {result.reservation.menu?.cafeteria?.name || 'N/A'}
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
              Yeni Tarama
            </button>
          </div>
        )}
      </div>

      <div className="instructions">
        <h3>Kullanım Talimatları:</h3>
        <ul>
          <li>QR kod okutucu cihazdan gelen kodu yukarıdaki alana girin</li>
          <li>Veya müşterinin telefonundaki QR kodu manuel olarak girin</li>
          <li>QR kod geçerliyse ve bugünün tarihine uygunsa yemek kullanılacaktır</li>
          <li>Kullanılan rezervasyonlar tekrar kullanılamaz</li>
        </ul>
      </div>
    </div>
  );
};

export default MealScanPage;





