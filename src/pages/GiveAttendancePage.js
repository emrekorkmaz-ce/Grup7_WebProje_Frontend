import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './GiveAttendancePage.css';

const GiveAttendancePage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleGiveAttendance = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/student/attendance/give/${sessionId}`, { location });
      setSuccess(true);
    } catch (err) {
      setError('Yoklama verilemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Navbar ve Sidebar eklemek için import edelim (eğer yukarıda yoksa)
  // Mevcut importlarda yok, o yüzden full replace yapıyorum.

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>

        {success ? (
          <div className="animate-scale-in">
            <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}>🎉</div>
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
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
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
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📍</div>
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
                  ✅ Buradayım
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GiveAttendancePage;
