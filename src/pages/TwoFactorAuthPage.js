import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './TwoFactorAuthPage.css';

const TwoFactorAuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data.data.twoFactorEnabled) {
        setIsEnabled(true);
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
    }
  };

  const handleGenerateSecret = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/2fa/generate');
      if (response.data.success) {
        setQrCode(response.data.data.qrCode);
        setSecret(response.data.data.secret);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Secret oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Geçerli bir 6 haneli kod girin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/2fa/verify-enable', {
        token: verificationToken
      });
      
      if (response.data.success) {
        setSuccess('2FA başarıyla etkinleştirildi!');
        setIsEnabled(true);
        setQrCode(null);
        setSecret(null);
        setVerificationToken('');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('2FA\'yı devre dışı bırakmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/2fa/disable');
      if (response.data.success) {
        setSuccess('2FA devre dışı bırakıldı');
        setIsEnabled(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Devre dışı bırakma başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="two-factor-page">
          <h1>İki Faktörlü Kimlik Doğrulama (2FA)</h1>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="card">
            <h2>2FA Durumu</h2>
            <p className={isEnabled ? 'status-enabled' : 'status-disabled'}>
              {isEnabled ? '✅ 2FA Etkin' : '❌ 2FA Devre Dışı'}
            </p>
          </div>

          {!isEnabled && (
            <div className="card">
              <h2>2FA'yı Etkinleştir</h2>
              <p>Hesabınızı daha güvenli hale getirmek için iki faktörlü kimlik doğrulamayı etkinleştirin.</p>
              
              {!qrCode && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleGenerateSecret}
                  disabled={loading}
                >
                  {loading ? 'Yükleniyor...' : 'QR Kod Oluştur'}
                </button>
              )}

              {qrCode && (
                <div className="qr-section">
                  <h3>1. Authenticator Uygulamanızla QR Kodu Tarayın</h3>
                  <div className="qr-code-container">
                    <img src={qrCode} alt="QR Code" />
                  </div>
                  
                  <p className="manual-entry">
                    <strong>Manuel Giriş Anahtarı:</strong> {secret}
                  </p>

                  <h3>2. Authenticator Uygulamanızdan Gelen Kodu Girin</h3>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))}
                    className="token-input"
                  />
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={handleVerifyAndEnable}
                    disabled={loading || verificationToken.length !== 6}
                  >
                    {loading ? 'Doğrulanıyor...' : 'Etkinleştir'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isEnabled && (
            <div className="card">
              <h2>2FA'yı Devre Dışı Bırak</h2>
              <p>2FA'yı devre dışı bırakmak hesabınızın güvenliğini azaltır.</p>
              <button 
                className="btn btn-danger" 
                onClick={handleDisable}
                disabled={loading}
              >
                {loading ? 'İşleniyor...' : '2FA\'yı Devre Dışı Bırak'}
              </button>
            </div>
          )}

          <div className="card info-card">
            <h2>2FA Nedir?</h2>
            <p>İki faktörlü kimlik doğrulama, hesabınıza giriş yaparken şifrenize ek olarak bir güvenlik kodu gerektirir.</p>
            <p><strong>Önerilen Uygulamalar:</strong></p>
            <ul>
              <li>Google Authenticator</li>
              <li>Microsoft Authenticator</li>
              <li>Authy</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TwoFactorAuthPage;

