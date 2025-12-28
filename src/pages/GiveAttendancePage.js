import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { MapPinIcon, CheckCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import Loading from '../components/Loading';

const GiveAttendancePage = () => {
  const { sessionId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
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
      setError(t('attendance.locationError'));
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError(t('attendance.locationPermissionError'));
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
      // Başarılı olduktan sonra 3 saniye sonra devamsızlık durumu sayfasına yönlendir
      setTimeout(() => {
        navigate('/my-attendance');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || t('attendance.attendanceFailed');
      setError(errorMsg);
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
              <h2 style={{ color: 'var(--success)' }}>{t('attendance.attendanceSuccess')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('attendance.attendanceRecorded')}</p>
            </div>
          ) : (
            <>
              <h2 className="mb-4">{t('attendance.giveAttendance')}</h2>

              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="spinner lg mb-4"></div>
                  <p style={{ color: 'var(--accent-color)' }}>{t('attendance.locationRequired')}</p>
                </div>
              ) : error ? (
                <div className="error text-center">
                  <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                    <MapPinIcon size={32} />
                  </div>
                  <p style={{ marginBottom: '1rem' }}>{error}</p>
                  {(error.includes('kayıtlı değilsiniz') || error.includes('not enrolled') || error.includes('enrolled')) && (
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}>
                      <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('common.solution')}:</p>
                      <p style={{ marginBottom: '0.5rem' }}>{t('attendance.notEnrolledDetails')}</p>
                      <Link 
                        to="/enroll-courses" 
                        className="btn btn-primary"
                        style={{ 
                          display: 'inline-block',
                          marginTop: '0.5rem',
                          textDecoration: 'none'
                        }}
                      >
                        {t('attendance.goToCourseSelection')}
                      </Link>
                    </div>
                  )}
                  <button className="btn btn-secondary mt-2 w-full" onClick={() => window.location.reload()}>
                    {t('common.tryAgain')}
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
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('attendance.locationDetected')}</div>
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
                    <CheckCircleIcon size={18} /> {language === 'en' ? 'I\'m Here' : 'Buradayım'}
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
