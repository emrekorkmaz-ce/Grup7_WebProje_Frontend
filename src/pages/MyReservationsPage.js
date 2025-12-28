import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './MyReservationsPage.css';

const MyReservationsPage = () => {
  const { t, language } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter === 'upcoming' ? 'reserved' : filter;
      }
      const response = await api.get('/meals/reservations/my-reservations', { params });
      setReservations(response.data.data || []);
      setError('');
    } catch (err) {
      setError(t('meals.loadReservationsError'));
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t('meals.cancelConfirm'))) {
      return;
    }

    try {
      await api.delete(`/meals/reservations/${id}`);
      alert(t('meals.cancelSuccess'));
      fetchReservations();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || t('meals.cancelError');
      alert(typeof errorMessage === 'string' ? errorMessage : t('meals.cancelError'));
      console.error('Cancel reservation error:', err);
    }
  };

  const canCancel = (reservation) => {
    if (reservation.status !== 'reserved') return false;
    
    const mealDate = new Date(reservation.date);
    const mealType = reservation.mealType || reservation.meal_type;
    const mealTime = mealType === 'lunch' ? 12 : mealType === 'dinner' ? 18 : 8;
    mealDate.setHours(mealTime, 0, 0, 0);
    
    const now = new Date();
    const hoursUntilMeal = (mealDate - now) / (1000 * 60 * 60);
    
    return hoursUntilMeal >= 2;
  };


  const upcomingReservations = reservations.filter(r => r.status === 'reserved');
  const pastReservations = reservations.filter(r => r.status === 'used');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  const filteredReservations = filter === 'all' ? reservations :
    filter === 'upcoming' ? upcomingReservations :
    filter === 'past' ? pastReservations :
    cancelledReservations;

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="my-reservations-page">
          <h1>{t('meals.myReservations')}</h1>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          {t('meals.all')} ({reservations.length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          {t('meals.upcoming')} ({upcomingReservations.length})
        </button>
        <button
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          {t('meals.past')} ({pastReservations.length})
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          {t('meals.cancelled')} ({cancelledReservations.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.length === 0 ? (
            <div className="no-reservations">{t('meals.noReservations')}</div>
          ) : (
            filteredReservations.map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
                canCancel={canCancel(reservation)}
                onShowQR={() => setSelectedQR(reservation)}
                t={t}
                language={language}
              />
            ))
          )}
        </div>
      )}

      {selectedQR && (
        <QRModal
          reservation={selectedQR}
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

const ReservationCard = ({ reservation, onCancel, canCancel, onShowQR, t, language }) => {
  const statusBadge = {
    reserved: { text: t('meals.reserved'), class: 'status-reserved' },
    used: { text: t('meals.used'), class: 'status-used' },
    cancelled: { text: t('meals.cancelled'), class: 'status-cancelled' }
  }[reservation.status] || { text: reservation.status, class: '' };

  const mealType = reservation.mealType || reservation.meal_type;
  const mealTypeLabel = {
    breakfast: t('meals.breakfast'),
    lunch: t('meals.lunch'),
    dinner: t('meals.dinner')
  }[mealType] || mealType;

  return (
    <div className="reservation-card">
      <div className="reservation-header">
        <div>
          <h3>{reservation.menu?.cafeteria?.name || t('meals.cafeteria')}</h3>
          <span className="date">
            {new Date(reservation.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        <span className={`status-badge ${statusBadge.class}`}>
          {statusBadge.text}
        </span>
      </div>

      <div className="reservation-details">
        <div className="detail-item">
          <strong>{t('meals.meal')}:</strong> {mealTypeLabel}
        </div>
        <div className="detail-item">
          <strong>{t('events.location')}:</strong> {reservation.menu?.cafeteria?.location}
        </div>
        {(reservation.menu?.itemsJson || reservation.menu?.items_json)?.main && (
          <div className="detail-item">
            <strong>{t('meals.mainCourse')}:</strong> {(reservation.menu.itemsJson || reservation.menu.items_json).main}
          </div>
        )}
        {reservation.amount > 0 && (
          <div className="detail-item">
            <strong>{t('wallet.amount')}:</strong> {reservation.amount} TRY
          </div>
        )}
        {(reservation.usedAt || reservation.used_at) && (
          <div className="detail-item">
            <strong>{t('meals.usedDate')}:</strong>{' '}
            {new Date(reservation.usedAt || reservation.used_at).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
          </div>
        )}
      </div>

      <div className="reservation-actions">
        {reservation.status === 'reserved' && (
          <button className="qr-btn" onClick={onShowQR}>
            {t('meals.showQR')}
          </button>
        )}
        {canCancel && (
          <button className="cancel-btn" onClick={() => onCancel(reservation.id)}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ reservation, onClose, t, language }) => {
  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: t('meals.breakfast'),
      lunch: t('meals.lunch'),
      dinner: t('meals.dinner')
    };
    return labels[type] || type;
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('meals.qrCode')}</h2>
        <div className="qr-code-container">
          <QRCodeSVG value={reservation.qrCode || reservation.qr_code} size={300} />
        </div>
        <div className="qr-code-text">
          <strong>{t('meals.qrCodeText')}:</strong> {reservation.qrCode || reservation.qr_code}
        </div>
        <div className="qr-info">
          <p>{t('meals.qrInfo')}</p>
          <p>
            <strong>{t('attendance.date')}:</strong>{' '}
            {new Date(reservation.date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
          </p>
          <p>
            <strong>{t('meals.meal')}:</strong>{' '}
            {getMealTypeLabel(reservation.mealType || reservation.meal_type)}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  );
};

export default MyReservationsPage;

