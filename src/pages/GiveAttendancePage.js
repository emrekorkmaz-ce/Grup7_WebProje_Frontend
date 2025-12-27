import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPinIcon, CheckCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const GiveAttendancePage = () => {
  const { sessionId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    // ProtectedRoute zaten authentication ve role kontrolü yapıyor
    // Burada sadece konum alıyoruz
    if (!user || user.role !== 'student') return;

    if (!('geolocation' in navigator)) {
      setError('Cihazınızda konum servisi bulunamadı.');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('Konum alınamadı. Lütfen izin verin.');
        setLoading(false);
      }
    );
  }, [user]);

  const handleGiveAttendance = async () => {
    if (!location || !user || user.role !== 'student') return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/student/attendance/give/${sessionId}`, { location });
      setSuccess(true);
      // Başarılı olduktan sonra 3 saniye sonra kapat
      setTimeout(() => {
        // İsteğe bağlı: Ana sayfaya yönlendir
        // navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Yoklama verilemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Loading durumu - ProtectedRoute zaten kontrol ediyor ama ekstra güvenlik için
  if (authLoading || !user || user.role !== 'student') {
    return <Loading />;
  }

  return (
    <div className="app-container">
      <main>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', margin: '0 auto' }}>

          {success ? (
            <div className="animate-scale-in">
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <CheckCircleIcon size={64} color="var(--success)" />
              </div>
              <h2 style={{ color: 'var(--success)' }}>Yoklama Başarılı!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Katılımınız sisteme kaydedildi.</p>
            </div>
          ) : (
            <>
              <h2 className="mb-4">Yoklama Ver</h2>

              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="spinner lg mb-4"></div>
                  <p style={{ color: 'var(--accent-color)' }}>Konum alınıyor...</p>
                </div>
              ) : error ? (
                <div className="error text-center">
                  <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                    <MapPinIcon size={32} />
                  </div>
                  {error}
                  <button className="btn btn-secondary mt-4 w-full" onClick={() => window.location.reload()}>
                    Tekrar Dene
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                      <MapPinIcon size={24} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Konumunuz Algılandı</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    onClick={handleGiveAttendance}
                    disabled={!location || loading}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                  >
                    <CheckCircleIcon size={18} /> Buradayım
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GiveAttendancePage;
