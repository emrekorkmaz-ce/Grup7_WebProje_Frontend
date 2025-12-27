import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
// import './MealScanPage.css'; // Using global styles instead

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

  const cardStyle = {
    backgroundColor: 'var(--card-bg-color)',
    borderRadius: 'var(--card-border-radius)',
    padding: 'var(--card-padding)',
    boxShadow: 'var(--box-shadow)',
    color: 'var(--primary-text-color)',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--secondary-bg)',
    color: 'var(--primary-text-color)',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--accent-color)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ marginBottom: '2rem', color: 'var(--primary-text-color)' }}>QR Kod Tarayıcı</h1>

          <div className="card" style={cardStyle}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--secondary-text-color)', textAlign: 'center' }}>
              Kafeterya personeli için yemek rezervasyonu kullanım sayfası
            </p>

            <div className="scan-container">
              <div className="input-section">
                <label htmlFor="qr-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>QR Kod:</label>
                <input
                  id="qr-input"
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="QR kodu buraya girin veya tarayın"
                  autoFocus
                  style={inputStyle}
                />
                <button
                  onClick={handleScan}
                  disabled={loading || !qrCode.trim()}
                  style={{ ...buttonStyle, opacity: loading || !qrCode.trim() ? 0.7 : 1 }}
                >
                  {loading ? 'İşleniyor...' : 'Tara ve Kullan'}
                </button>
              </div>

              {error && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' }}>
                  <strong>Hata:</strong> {error}
                </div>
              )}

              {result && result.success && (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                  <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>✓ Başarılı</h3>
                  <p style={{ marginBottom: '1rem' }}>{result.message}</p>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div><strong>Kullanıcı:</strong> {result.reservation.user?.fullName || 'N/A'}</div>
                    <div><strong>Öğün:</strong> {result.reservation.meal_type === 'lunch' ? 'Öğle Yemeği' : result.reservation.meal_type === 'dinner' ? 'Akşam Yemeği' : 'Kahvaltı'}</div>
                    <div><strong>Tarih:</strong> {new Date(result.reservation.date).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <button
                    onClick={() => {
                      setResult(null);
                      setQrCode('');
                      setError('');
                    }}
                    style={{ ...buttonStyle, marginTop: '1rem', backgroundColor: '#66bb6a' }}
                  >
                    Yeni Tarama
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem', maxWidth: '600px', color: 'var(--secondary-text-color)', fontSize: '0.9rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Kullanım Talimatları:</h3>
            <ul style={{ listStylePosition: 'inside', lineHeight: '1.6' }}>
              <li>QR kod okutucu cihazdan gelen kodu yukarıdaki alana girin.</li>
              <li>Veya müşterinin telefonundaki QR kodu manuel olarak girin.</li>
              <li>QR kod geçerliyse ve bugünün tarihine uygunsa yemek kullanılacaktır.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealScanPage;












