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

  useEffect(() => {
    fetchEvent();
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

  const handleRegister = async () => {
    if (!event) return;

    if (event.registered_count >= event.capacity) {
      alert('Etkinlik dolu.');
      return;
    }

    if (new Date() > new Date(event.registration_deadline)) {
      alert('Kayıt süresi dolmuş.');
      return;
    }

    try {
      setRegistering(true);
      await api.post(`/events/${id}/register`, {
        custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined
      });
      alert('Etkinliğe başarıyla kaydoldunuz!');
      navigate('/my-events');
    } catch (err) {
      alert(err.response?.data?.error || 'Kayıt yapılamadı.');
    } finally {
      setRegistering(false);
    }
  };

  const canRegister = () => {
    if (!event) return false;
    if (event.registered_count >= event.capacity) return false;
    if (new Date() > new Date(event.registration_deadline)) return false;
    return true;
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

  const remainingSpots = event.capacity - event.registered_count;

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
          {event.is_paid && (
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
              <strong>Saat:</strong> {event.start_time} - {event.end_time}
            </div>
            <div className="info-item">
              <strong>Konum:</strong> {event.location}
            </div>
            <div className="info-item">
              <strong>Kapasite:</strong> {event.registered_count} / {event.capacity} kayıtlı
            </div>
            {event.is_paid && event.price && (
              <div className="info-item">
                <strong>Ücret:</strong> {event.price} TRY
              </div>
            )}
            <div className="info-item">
              <strong>Kayıt Son Tarihi:</strong>{' '}
              {new Date(event.registration_deadline).toLocaleDateString('tr-TR')}
            </div>
          </div>

          {event.description && (
            <div className="description-card">
              <h3>Açıklama</h3>
              <p>{event.description}</p>
            </div>
          )}

          {canRegister() && (
            <div className="registration-section">
              <h3>Kayıt Ol</h3>
              {remainingSpots > 0 && (
                <p className="spots-remaining">
                  {remainingSpots} kontenjan kaldı
                </p>
              )}
              <button
                onClick={handleRegister}
                disabled={registering || !canRegister()}
                className="register-btn"
              >
                {registering ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </div>
          )}

          {!canRegister() && (
            <div className="registration-closed">
              {event.registered_count >= event.capacity ? (
                <p>Etkinlik dolu. Kayıt yapılamaz.</p>
              ) : (
                <p>Kayıt süresi dolmuş.</p>
              )}
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


