import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { GraduationCapIcon } from '../components/Icons';
import bgImage from '../assets/university_bg.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      const message = 'Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.';
      setSuccess(message);
    } catch (error) {
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || 'Sıfırlama e-postası gönderilemedi');
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            margin: '0 auto 1.5rem auto',
            width: '64px',
            height: '64px',
            background: 'var(--accent-color)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <GraduationCapIcon size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Şifremi Unuttum</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--success)' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="ornek@uni.edu.tr"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>
        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Şifrenizi hatırladınız mı? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>Giriş yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

