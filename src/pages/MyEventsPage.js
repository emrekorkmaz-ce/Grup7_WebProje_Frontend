import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './MyEventsPage.css';

const MyEventsPage = () => {
  const { t, language } = useTranslation();
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
      console.log('[MyEventsPage] Fetching registrations...');
      // Get current user's event registrations
      const response = await api.get('/events/my-registrations');
      console.log('[MyEventsPage] Response:', response.data);
      const registrations = response.data.data || [];
      console.log('[MyEventsPage] Registrations:', registrations);
      setRegistrations(registrations);
      setError('');
    } catch (err) {
      setError(t('myEvents.loadError'));
      console.error('[MyEventsPage] Error fetching registrations:', err);
      console.error('[MyEventsPage] Error response:', err.response?.data);
      console.error('[MyEventsPage] Error status:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId, regId) => {
    if (!window.confirm(t('myEvents.cancelConfirm'))) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}/registrations/${regId}`);
      alert(t('myEvents.cancelSuccess'));
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.error || t('myEvents.cancelError'));
    }
  };

  const upcomingRegistrations = registrations.filter(r => {
    const eventDate = new Date(r.event?.date);
    return eventDate >= new Date() && !r.checkedIn;
  });

  const pastRegistrations = registrations.filter(r => {
    const eventDate = new Date(r.event?.date);
    return eventDate < new Date() || r.checkedIn;
  });

  const filteredRegistrations = filter === 'all' ? registrations :
    filter === 'upcoming' ? upcomingRegistrations :
    pastRegistrations;

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="my-events-page">
          <h1>{t('myEvents.title')}</h1>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          {t('myEvents.all')} ({registrations.length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          {t('myEvents.upcoming')} ({upcomingRegistrations.length})
        </button>
        <button
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          {t('myEvents.past')} ({pastRegistrations.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">{t('myEvents.loading')}</div>
      ) : (
        <div className="registrations-list">
          {filteredRegistrations.length === 0 ? (
            <div className="no-registrations">{t('myEvents.noRegistrations')}</div>
          ) : (
            filteredRegistrations.map(registration => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onCancel={handleCancel}
                onShowQR={() => setSelectedQR(registration)}
                t={t}
                language={language}
              />
            ))
          )}
        </div>
      )}

      {selectedQR && (
        <QRModal
          registration={selectedQR}
          onClose={() => setSelectedQR(null)}
          t={t}
          language={language}
        />
      )}
        </div>
      </main>
    </div>
  );
};

const RegistrationCard = ({ registration, onCancel, onShowQR, t, language }) => {
  const event = registration.event;
  const isUpcoming = new Date(event?.date) >= new Date();

  return (
    <div className="registration-card">
      <div className="registration-header">
        <div>
          <h3>{event?.title}</h3>
          <span className="date">
            {new Date(event?.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        <div className="status-badges">
          {registration.checkedIn ? (
            <span className="status-badge status-checked-in">{t('myEvents.status.checkedIn')}</span>
          ) : isUpcoming ? (
            <span className="status-badge status-upcoming">{t('myEvents.status.upcoming')}</span>
          ) : (
            <span className="status-badge status-past">{t('myEvents.status.past')}</span>
          )}
        </div>
      </div>

      <div className="registration-details">
        <div className="detail-item">
          <strong>{t('myEvents.time')}:</strong> {event?.startTime} - {event?.endTime}
        </div>
        <div className="detail-item">
          <strong>{t('myEvents.location')}:</strong> {event?.location}
        </div>
        {registration.checkedInAt && (
          <div className="detail-item">
            <strong>{t('myEvents.checkInDate')}:</strong>{' '}
            {new Date(registration.checkedInAt).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
          </div>
        )}
      </div>

      <div className="registration-actions">
        {isUpcoming && !registration.checkedIn && (
          <button className="qr-btn" onClick={onShowQR}>
            {t('myEvents.showQR')}
          </button>
        )}
        {isUpcoming && !registration.checkedIn && (
          <button
            className="cancel-btn"
            onClick={() => onCancel(event?.id, registration.id)}
          >
            {t('myEvents.cancel')}
          </button>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ registration, onClose, t, language }) => {
  const event = registration.event;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('myEvents.qrCode')}</h2>
        <div className="qr-code-container">
          <QRCodeSVG value={registration.qrCode} size={300} />
        </div>
        <div className="qr-code-text">
          <strong>{t('myEvents.qrCodeText')}:</strong> {registration.qrCode}
        </div>
        <div className="qr-info">
          <p>{t('myEvents.qrInfo')}</p>
          <p><strong>{t('myEvents.event')}:</strong> {event?.title}</p>
          <p>
            <strong>{t('events.date')}:</strong>{' '}
            {new Date(event?.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
          </p>
          <p>
            <strong>{t('myEvents.time')}:</strong> {event?.startTime} - {event?.endTime}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>{t('myEvents.close')}</button>
      </div>
    </div>
  );
};

export default MyEventsPage;

