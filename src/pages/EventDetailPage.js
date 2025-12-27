import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './EventDetailPage.css';

const EventDetailPage = () => {
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
      setError('Etkinlik yüklenemedi.');
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
      alert('Kayıt süresi dolmuş.');
      return;
    }

    try {
      setRegistering(true);
      const response = await api.post(`/events/${id}/register`, {
        custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined
      });
      
      if (response.data.data.waitlist) {
        alert(`Etkinlik dolu. Bekleme listesine eklendiniz. Pozisyonunuz: ${response.data.data.position}`);
        await fetchWaitlist();
      } else {
        alert('Etkinliğe başarıyla kaydoldunuz!');
        navigate('/my-events');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Kayıt yapılamadı.';
      if (err.response?.data?.waitlistPosition) {
        alert(`${errorMsg} Bekleme listesi pozisyonunuz: ${err.response.data.waitlistPosition}`);
        await fetchWaitlist();
      } else {
        alert(errorMsg);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleRemoveFromWaitlist = async () => {
    if (!window.confirm('Bekleme listesinden çıkmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/events/${id}/waitlist`);
      alert('Bekleme listesinden çıkarıldınız.');
      setOnWaitlist(false);
      await fetchWaitlist();
    } catch (err) {
      alert(err.response?.data?.error || 'İşlem başarısız.');
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
      conference: 'Konferans',
      workshop: 'Workshop',
      social: 'Sosyal',
      sports: 'Spor',
      academic: 'Akademik',
      cultural: 'Kültürel'
    };
    return labels[category] || category;
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error || !event) {
    return <div className="error-message">{error || 'Etkinlik bulunamadı.'}</div>;
  }

  const remainingSpots = event.capacity - event.registeredCount;

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="event-detail-page">
          <button className="back-btn" onClick={() => navigate('/events')}>
            ← Geri
      </button>

      <div className="event-detail-header">
        <div className="event-category">
          <span className={`category-badge category-${event.category}`}>
            {getCategoryLabel(event.category)}
          </span>
          {event.isPaid && (
            <span className="paid-badge">Ücretli</span>
          )}
        </div>
        <h1>{event.title}</h1>
      </div>

      <div className="event-detail-content">
        <div className="event-main-info">
          <div className="info-card">
            <h3>Etkinlik Bilgileri</h3>
            <div className="info-item">
              <strong>Tarih:</strong>{' '}
              {new Date(event.date).toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="info-item">
              <strong>Saat:</strong> {event.startTime} - {event.endTime}
            </div>
            <div className="info-item">
              <strong>Konum:</strong> {event.location}
            </div>
            <div className="info-item">
              <strong>Kapasite:</strong> {event.registeredCount} / {event.capacity} kayıtlı
            </div>
            {event.isPaid && event.price && (
              <div className="info-item">
                <strong>Ücret:</strong> {event.price} TRY
              </div>
            )}
            <div className="info-item">
              <strong>Kayıt Son Tarihi:</strong>{' '}
              {new Date(event.registrationDeadline).toLocaleDateString('tr-TR')}
            </div>
          </div>

          {event.description && (
            <div className="description-card">
              <h3>Açıklama</h3>
              <p>{event.description}</p>
            </div>
          )}

          {onWaitlist ? (
            <div className="waitlist-info">
              <h3>Bekleme Listesindesiniz</h3>
              <p className="waitlist-message">
                Pozisyonunuz: <strong>#{waitlistInfo?.userPosition}</strong>
              </p>
              <p className="waitlist-help">
                Etkinlikte yer açıldığında size bildirim gönderilecektir.
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={handleRemoveFromWaitlist}
              >
                Bekleme Listesinden Çık
              </button>
            </div>
          ) : canRegister() ? (
            <div className="registration-section">
              <h3>Kayıt Ol</h3>
              {remainingSpots > 0 ? (
                <p className="spots-remaining">
                  {remainingSpots} kontenjan kaldı
                </p>
              ) : (
                <p className="spots-remaining" style={{ color: 'var(--warning)' }}>
                  Etkinlik dolu - Bekleme listesine ekleneceksiniz
                </p>
              )}
              <button
                onClick={handleRegister}
                disabled={registering || !canRegister()}
                className="register-btn"
              >
                {registering ? 'Kaydediliyor...' : isFull() ? 'Bekleme Listesine Ekle' : 'Kayıt Ol'}
              </button>
            </div>
          ) : (
            <div className="registration-closed">
              {new Date() > new Date(event.registrationDeadline) ? (
                <p>Kayıt süresi dolmuş.</p>
              ) : (
                <p>Kayıt yapılamıyor.</p>
              )}
            </div>
          )}

          {waitlistInfo && waitlistInfo.totalOnWaitlist > 0 && (
            <div className="waitlist-stats">
              <p>Bekleme listesinde <strong>{waitlistInfo.totalOnWaitlist}</strong> kişi var.</p>
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


