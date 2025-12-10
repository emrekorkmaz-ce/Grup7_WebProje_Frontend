import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Don't do anything if token is not available yet
    if (!token) {
      // Wait a moment for React Router to populate the token
      const timer = setTimeout(() => {
        if (!token) {
          setStatus('error');
          setMessage('Doğrulama token\'ı bulunamadı.');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    let isMounted = true;

    const verifyEmail = async () => {
      console.log('🔍 VerifyEmail: Token from URL:', token);
      
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('E-posta başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('❌ Verification error:', error);
        console.error('❌ Error response:', error.response?.data);
        
        // Only show error if we have a response (not a network error)
        // Network errors might be temporary, so we'll keep showing "verifying"
        if (isMounted && error.response) {
          const statusCode = error.response.status;
          // Only show error for client errors (4xx), not server errors (5xx) or network errors
          if (statusCode >= 400 && statusCode < 500) {
            setStatus('error');
            const errorMessage = error.response?.data?.error?.message || 
                                error.response?.data?.error || 
                                error.response?.data?.message ||
                                'Doğrulama başarısız. Bağlantı geçersiz veya süresi dolmuş olabilir.';
            setMessage(errorMessage);
          }
          // For 5xx or network errors, keep showing "verifying" state
        }
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h2>E-postanız doğrulanıyor...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>E-posta Doğrulandı!</h2>
            <p>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Doğrulama Başarısız</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/login')} className="back-button">
              Giriş Sayfasına Git
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

