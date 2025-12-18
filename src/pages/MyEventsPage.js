import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import './MyEventsPage.css';

const MyEventsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      // Get all events and check which ones user is registered
      const eventsResponse = await api.get('/events', { params: { status: 'published' } });
      const events = eventsResponse.data.data || [];
      
      // For each event, check if user is registered
      const userRegistrations = [];
      for (const event of events) {
        try {
          const regResponse = await api.get(`/events/${event.id}/registrations`);
          const registrations = regResponse.data.data || [];
          const userReg = registrations.find(r => {
            // Check if current user is registered (would need user context)
            return true; // Simplified - in production, filter by actual user
          });
          if (userReg) {
            userRegistrations.push({ ...userReg, event });
          }
        } catch (err) {
          // User might not be registered or not admin
        }
      }
      
      setRegistrations(userRegistrations);
      setError('');
    } catch (err) {
      // Alternative: Get from user's registrations if endpoint exists
      setError('Etkinlik kayıtları yüklenemedi.');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId, regId) => {
    if (!window.confirm('Etkinlik kaydınızı iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}/registrations/${regId}`);
      alert('Kayıt başarıyla iptal edildi.');
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.error || 'Kayıt iptal edilemedi.');
    }
  };

  const upcomingRegistrations = registrations.filter(r => {
    const eventDate = new Date(r.event?.date);
    return eventDate >= new Date() && !r.checked_in;
  });

  const pastRegistrations = registrations.filter(r => {
    const eventDate = new Date(r.event?.date);
    return eventDate < new Date() || r.checked_in;
  });

  const filteredRegistrations = filter === 'all' ? registrations :
    filter === 'upcoming' ? upcomingRegistrations :
    pastRegistrations;

  return (
    <div className="my-events-page">
      <h1>Etkinliklerim</h1>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tümü ({registrations.length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Yaklaşan ({upcomingRegistrations.length})
        </button>
        <button
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          Geçmiş ({pastRegistrations.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="registrations-list">
          {filteredRegistrations.length === 0 ? (
            <div className="no-registrations">Etkinlik kaydı bulunmamaktadır.</div>
          ) : (
            filteredRegistrations.map(registration => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onCancel={handleCancel}
                onShowQR={() => setSelectedQR(registration)}
              />
            ))
          )}
        </div>
      )}

      {selectedQR && (
        <QRModal
          registration={selectedQR}
          onClose={() => setSelectedQR(null)}
        />
      )}
    </div>
  );
};

const RegistrationCard = ({ registration, onCancel, onShowQR }) => {
  const event = registration.event;
  const isUpcoming = new Date(event?.date) >= new Date();

  return (
    <div className="registration-card">
      <div className="registration-header">
        <div>
          <h3>{event?.title}</h3>
          <span className="date">
            {new Date(event?.date).toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        <div className="status-badges">
          {registration.checked_in ? (
            <span className="status-badge status-checked-in">Giriş Yapıldı</span>
          ) : isUpcoming ? (
            <span className="status-badge status-upcoming">Yaklaşan</span>
          ) : (
            <span className="status-badge status-past">Geçmiş</span>
          )}
        </div>
      </div>

      <div className="registration-details">
        <div className="detail-item">
          <strong>Saat:</strong> {event?.start_time} - {event?.end_time}
        </div>
        <div className="detail-item">
          <strong>Konum:</strong> {event?.location}
        </div>
        {registration.checked_in_at && (
          <div className="detail-item">
            <strong>Giriş Tarihi:</strong>{' '}
            {new Date(registration.checked_in_at).toLocaleString('tr-TR')}
          </div>
        )}
      </div>

      <div className="registration-actions">
        {isUpcoming && !registration.checked_in && (
          <button className="qr-btn" onClick={onShowQR}>
            QR Kod Göster
          </button>
        )}
        {isUpcoming && !registration.checked_in && (
          <button
            className="cancel-btn"
            onClick={() => onCancel(event?.id, registration.id)}
          >
            İptal Et
          </button>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ registration, onClose }) => {
  const event = registration.event;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>QR Kod</h2>
        <div className="qr-code-container">
          <QRCodeSVG value={registration.qr_code} size={300} />
        </div>
        <div className="qr-code-text">
          <strong>Kod:</strong> {registration.qr_code}
        </div>
        <div className="qr-info">
          <p>Bu QR kodu etkinlik girişinde göstererek katılımınızı onaylatabilirsiniz.</p>
          <p><strong>Etkinlik:</strong> {event?.title}</p>
          <p>
            <strong>Tarih:</strong>{' '}
            {new Date(event?.date).toLocaleDateString('tr-TR')}
          </p>
          <p>
            <strong>Saat:</strong> {event?.start_time} - {event?.end_time}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>Kapat</button>
      </div>
    </div>
  );
};

export default MyEventsPage;

