import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import './MyReservationsPage.css';

const MyReservationsPage = () => {
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
      setError('Rezervasyonlar yüklenemedi. Lütfen tekrar deneyin.');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/meals/reservations/${id}`);
      alert('Rezervasyon başarıyla iptal edildi.');
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Rezervasyon iptal edilemedi.');
    }
  };

  const canCancel = (reservation) => {
    if (reservation.status !== 'reserved') return false;
    
    const mealDate = new Date(reservation.date);
    const mealTime = reservation.meal_type === 'lunch' ? 12 : reservation.meal_type === 'dinner' ? 18 : 8;
    mealDate.setHours(mealTime, 0, 0, 0);
    
    const now = new Date();
    const hoursUntilMeal = (mealDate - now) / (1000 * 60 * 60);
    
    return hoursUntilMeal >= 2;
  };

  const getStatusBadge = (status) => {
    const badges = {
      reserved: { text: 'Rezerve', class: 'status-reserved' },
      used: { text: 'Kullanıldı', class: 'status-used' },
      cancelled: { text: 'İptal Edildi', class: 'status-cancelled' }
    };
    return badges[status] || { text: status, class: '' };
  };

  const upcomingReservations = reservations.filter(r => r.status === 'reserved');
  const pastReservations = reservations.filter(r => r.status === 'used');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  const filteredReservations = filter === 'all' ? reservations :
    filter === 'upcoming' ? upcomingReservations :
    filter === 'past' ? pastReservations :
    cancelledReservations;

  return (
    <div className="my-reservations-page">
      <h1>Rezervasyonlarım</h1>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tümü ({reservations.length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Yaklaşan ({upcomingReservations.length})
        </button>
        <button
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          Geçmiş ({pastReservations.length})
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          İptal Edilen ({cancelledReservations.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.length === 0 ? (
            <div className="no-reservations">Rezervasyon bulunmamaktadır.</div>
          ) : (
            filteredReservations.map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
                canCancel={canCancel(reservation)}
                onShowQR={() => setSelectedQR(reservation)}
              />
            ))
          )}
        </div>
      )}

      {selectedQR && (
        <QRModal
          reservation={selectedQR}
          onClose={() => setSelectedQR(null)}
        />
      )}
    </div>
  );
};

const ReservationCard = ({ reservation, onCancel, canCancel, onShowQR }) => {
  const statusBadge = {
    reserved: { text: 'Rezerve', class: 'status-reserved' },
    used: { text: 'Kullanıldı', class: 'status-used' },
    cancelled: { text: 'İptal Edildi', class: 'status-cancelled' }
  }[reservation.status] || { text: reservation.status, class: '' };

  const mealTypeLabel = {
    breakfast: 'Kahvaltı',
    lunch: 'Öğle Yemeği',
    dinner: 'Akşam Yemeği'
  }[reservation.meal_type] || reservation.meal_type;

  return (
    <div className="reservation-card">
      <div className="reservation-header">
        <div>
          <h3>{reservation.menu?.cafeteria?.name || 'Kafeterya'}</h3>
          <span className="date">
            {new Date(reservation.date).toLocaleDateString('tr-TR', {
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
          <strong>Öğün:</strong> {mealTypeLabel}
        </div>
        <div className="detail-item">
          <strong>Konum:</strong> {reservation.menu?.cafeteria?.location}
        </div>
        {reservation.menu?.items_json?.main && (
          <div className="detail-item">
            <strong>Ana Yemek:</strong> {reservation.menu.items_json.main}
          </div>
        )}
        {reservation.amount > 0 && (
          <div className="detail-item">
            <strong>Tutar:</strong> {reservation.amount} TRY
          </div>
        )}
        {reservation.used_at && (
          <div className="detail-item">
            <strong>Kullanım Tarihi:</strong>{' '}
            {new Date(reservation.used_at).toLocaleString('tr-TR')}
          </div>
        )}
      </div>

      <div className="reservation-actions">
        {reservation.status === 'reserved' && (
          <button className="qr-btn" onClick={onShowQR}>
            QR Kod Göster
          </button>
        )}
        {canCancel && (
          <button className="cancel-btn" onClick={() => onCancel(reservation.id)}>
            İptal Et
          </button>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ reservation, onClose }) => {
  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>QR Kod</h2>
        <div className="qr-code-container">
          <QRCodeSVG value={reservation.qr_code} size={300} />
        </div>
        <div className="qr-code-text">
          <strong>Kod:</strong> {reservation.qr_code}
        </div>
        <div className="qr-info">
          <p>Bu QR kodu kafeteryada göstererek yemeğinizi alabilirsiniz.</p>
          <p>
            <strong>Tarih:</strong>{' '}
            {new Date(reservation.date).toLocaleDateString('tr-TR')}
          </p>
          <p>
            <strong>Öğün:</strong>{' '}
            {reservation.meal_type === 'lunch' ? 'Öğle Yemeği' :
             reservation.meal_type === 'dinner' ? 'Akşam Yemeği' : 'Kahvaltı'}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>Kapat</button>
      </div>
    </div>
  );
};

export default MyReservationsPage;

