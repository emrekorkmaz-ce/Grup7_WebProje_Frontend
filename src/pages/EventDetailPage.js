import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const { t, language } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [customFields, setCustomFields] = useState({});
  const [waitlistInfo, setWaitlistInfo] = useState(null);
  const [onWaitlist, setOnWaitlist] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchWaitlist();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
      setError('');
    } catch (err) {
      setError(language === 'en' ? 'Failed to load event.' : 'Etkinlik yüklenemedi.');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlist = async () => {
    try {
      const response = await api.get(`/events/${id}/waitlist`);
      if (response.data.success) {
        setWaitlistInfo(response.data.data);
        setOnWaitlist(response.data.data.userPosition !== null);
      }
    } catch (err) {
      // Waitlist yoksa veya hata varsa sessizce devam et
      console.log('Waitlist bilgisi alınamadı:', err);
    }
  };

  const handleRegister = async () => {
    if (!event) return;

    if (new Date() > new Date(event.registrationDeadline)) {
      alert(language === 'en' ? 'Registration deadline has passed.' : 'Kayıt süresi dolmuş.');
      return;
    }

    try {
      setRegistering(true);
      const response = await api.post(`/events/${id}/register`, {
        custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined
      });
      
      if (response.data.data.waitlist) {
        alert(language === 'en' ? `Event is full. You have been added to the waitlist. Your position: ${response.data.data.position}` : `Etkinlik dolu. Bekleme listesine eklendiniz. Pozisyonunuz: ${response.data.data.position}`);
        await fetchWaitlist();
      } else {
        alert(language === 'en' ? 'Successfully registered for the event!' : 'Etkinliğe başarıyla kaydoldunuz!');
        navigate('/my-events');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || (language === 'en' ? 'Failed to register.' : 'Kayıt yapılamadı.');
      if (err.response?.data?.waitlistPosition) {
        alert(`${errorMsg} ${language === 'en' ? 'Waitlist position:' : 'Bekleme listesi pozisyonunuz:'} ${err.response.data.waitlistPosition}`);
        await fetchWaitlist();
      } else {
        alert(errorMsg);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleRemoveFromWaitlist = async () => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to remove yourself from the waitlist?' : 'Bekleme listesinden çıkmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/events/${id}/waitlist`);
      alert(language === 'en' ? 'Removed from waitlist.' : 'Bekleme listesinden çıkarıldınız.');
      setOnWaitlist(false);
      await fetchWaitlist();
    } catch (err) {
      alert(err.response?.data?.error || (language === 'en' ? 'Operation failed.' : 'İşlem başarısız.'));
    }
  };

  const canRegister = () => {
    if (!event) return false;
    if (new Date() > new Date(event.registrationDeadline)) return false;
    if (onWaitlist) return false; // Already on waitlist
    return true;
  };

  const isFull = () => {
    return event && event.registeredCount >= event.capacity;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      conference: t('events.conference'),
      workshop: t('events.workshop'),
      social: t('events.social'),
      sports: t('events.sports'),
      academic: t('events.academic'),
      cultural: t('events.cultural')
    };
    return labels[category] || category;
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error || !event) {
    return <div className="error-message">{error || (language === 'en' ? 'Event not found.' : 'Etkinlik bulunamadı.')}</div>;
  }

  const remainingSpots = event.capacity - event.registeredCount;

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="event-detail-page">
          <button className="back-btn" onClick={() => navigate('/events')}>
            ← {t('common.back')}
      </button>

      <div className="event-detail-header">
        <div className="event-category">
          <span className={`category-badge category-${event.category}`}>
            {getCategoryLabel(event.category)}
          </span>
          {event.isPaid && (
            <span className="paid-badge">{language === 'en' ? 'Paid' : 'Ücretli'}</span>
          )}
        </div>
        <h1>{event.title}</h1>
      </div>

      <div className="event-detail-content">
        <div className="event-main-info">
          <div className="info-card">
            <h3>{language === 'en' ? 'Event Information' : 'Etkinlik Bilgileri'}</h3>
            <div className="info-item">
              <strong>{t('attendance.date')}:</strong>{' '}
              {new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="info-item">
              <strong>{t('events.time')}:</strong> {event.startTime} - {event.endTime}
            </div>
            <div className="info-item">
              <strong>{t('events.location')}:</strong> {event.location}
            </div>
            <div className="info-item">
              <strong>{t('events.capacity')}:</strong> {event.registeredCount} / {event.capacity} {language === 'en' ? 'registered' : 'kayıtlı'}
            </div>
            {event.isPaid && event.price && (
              <div className="info-item">
                <strong>{language === 'en' ? 'Price:' : 'Ücret:'}</strong> {event.price} TRY
              </div>
            )}
            <div className="info-item">
              <strong>{language === 'en' ? 'Registration Deadline:' : 'Kayıt Son Tarihi:'}</strong>{' '}
              {new Date(event.registrationDeadline).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
            </div>
          </div>

          {event.description && (
            <div className="description-card">
              <h3>{t('events.description')}</h3>
              <p>{event.description}</p>
            </div>
          )}

          {onWaitlist ? (
            <div className="waitlist-info">
              <h3>{t('events.onWaitlist')}</h3>
              <p className="waitlist-message">
                {t('events.position')}: <strong>#{waitlistInfo?.userPosition}</strong>
              </p>
              <p className="waitlist-help">
                {language === 'en' ? 'You will be notified when a spot opens up in the event.' : 'Etkinlikte yer açıldığında size bildirim gönderilecektir.'}
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={handleRemoveFromWaitlist}
              >
                {t('events.removeFromWaitlist')}
              </button>
            </div>
          ) : canRegister() ? (
            <div className="registration-section">
              <h3>{t('events.register')}</h3>
              {remainingSpots > 0 ? (
                <p className="spots-remaining">
                  {remainingSpots} {language === 'en' ? 'spots remaining' : 'kontenjan kaldı'}
                </p>
              ) : (
                <p className="spots-remaining" style={{ color: 'var(--warning)' }}>
                  {language === 'en' ? 'Event is full - You will be added to the waitlist' : 'Etkinlik dolu - Bekleme listesine ekleneceksiniz'}
                </p>
              )}
              <button
                onClick={handleRegister}
                disabled={registering || !canRegister()}
                className="register-btn"
              >
                {registering ? (language === 'en' ? 'Registering...' : 'Kaydediliyor...') : isFull() ? t('events.waitlist') : t('events.register')}
              </button>
            </div>
          ) : (
            <div className="registration-closed">
              {new Date() > new Date(event.registrationDeadline) ? (
                <p>{language === 'en' ? 'Registration deadline has passed.' : 'Kayıt süresi dolmuş.'}</p>
              ) : (
                <p>{language === 'en' ? 'Registration unavailable.' : 'Kayıt yapılamıyor.'}</p>
              )}
            </div>
          )}

          {waitlistInfo && waitlistInfo.totalOnWaitlist > 0 && (
            <div className="waitlist-stats">
              <p>{t('events.waitlistStats', { count: waitlistInfo.totalOnWaitlist })}</p>
            </div>
          )}
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;


