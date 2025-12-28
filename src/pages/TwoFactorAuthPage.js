import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './TwoFactorAuthPage.css';

const TwoFactorAuthPage = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
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
      setError(err.response?.data?.error || t('profile.twoFactorErrorGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError(t('profile.twoFactorErrorInvalidCode'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/2fa/verify-enable', {
        token: verificationToken
      });
      
      if (response.data.success) {
        setSuccess(t('profile.twoFactorSuccessEnabled'));
        setIsEnabled(true);
        setQrCode(null);
        setSecret(null);
        setVerificationToken('');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('profile.twoFactorErrorVerify'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm(t('profile.twoFactorDisableConfirm'))) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/2fa/disable');
      if (response.data.success) {
        setSuccess(t('profile.twoFactorSuccessDisabled'));
        setIsEnabled(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('profile.twoFactorErrorDisable'));
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
          <h1>{t('profile.twoFactorTitle')}</h1>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="card">
            <h2>{t('profile.twoFactorStatus')}</h2>
            <p className={isEnabled ? 'status-enabled' : 'status-disabled'}>
              {isEnabled ? t('profile.twoFactorEnabled') : t('profile.twoFactorDisabled')}
            </p>
          </div>

          {!isEnabled && (
            <div className="card">
              <h2>{t('profile.twoFactorEnableTitle')}</h2>
              <p>{t('profile.twoFactorEnableDesc')}</p>
              
              {!qrCode && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleGenerateSecret}
                  disabled={loading}
                >
                  {loading ? t('profile.twoFactorLoading') : t('profile.twoFactorGenerateQR')}
                </button>
              )}

              {qrCode && (
                <div className="qr-section">
                  <h3>{t('profile.twoFactorScanQR')}</h3>
                  <div className="qr-code-container">
                    <img src={qrCode} alt="QR Code" />
                  </div>
                  
                  <p className="manual-entry">
                    <strong>{t('profile.twoFactorManualKey')}</strong> {secret}
                  </p>

                  <h3>{t('profile.twoFactorEnterCode')}</h3>
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
                    {loading ? t('profile.twoFactorVerifying') : t('profile.twoFactorEnable')}
                  </button>
                </div>
              )}
            </div>
          )}

          {isEnabled && (
            <div className="card">
              <h2>{t('profile.twoFactorDisableTitle')}</h2>
              <p>{t('profile.twoFactorDisableDesc')}</p>
              <button 
                className="btn btn-danger" 
                onClick={handleDisable}
                disabled={loading}
              >
                {loading ? t('profile.twoFactorProcessing') : t('profile.twoFactorDisable')}
              </button>
            </div>
          )}

          <div className="card info-card">
            <h2>{t('profile.twoFactorWhatIs')}</h2>
            <p className="info-desc">{t('profile.twoFactorWhatIsDesc')}</p>
            
            <div className="info-section">
              <h3>{t('profile.twoFactorHowItWorks')}</h3>
              <p className="info-steps">{t('profile.twoFactorHowItWorksDesc')}</p>
            </div>

            <div className="info-section">
              <h3>{t('profile.twoFactorRecommendedApps')}</h3>
              <ul className="apps-list">
                <li>
                  <strong>Google Authenticator</strong> - {language === 'en' ? 'Free for iOS and Android' : 'iOS ve Android için ücretsiz'}
                </li>
                <li>
                  <strong>Microsoft Authenticator</strong> - {language === 'en' ? 'Integrated with Microsoft accounts' : 'Microsoft hesaplarıyla entegre'}
                </li>
                <li>
                  <strong>Authy</strong> - {language === 'en' ? 'Cloud backup features' : 'Bulut yedekleme özellikli'}
                </li>
              </ul>
            </div>

            <div className="info-section security-note">
              <h3>{t('profile.twoFactorSecurityNote')}</h3>
              <p>{t('profile.twoFactorSecurityNoteDesc')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TwoFactorAuthPage;

