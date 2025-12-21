import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './ClassroomReservationsPage.css';

const ClassroomReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classroom_id: '',
    date: '',
    start_time: '',
    end_time: '',
    purpose: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchClassrooms();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations');
      setReservations(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Rezervasyonlar yüklenemedi.');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      // Assuming there's a classrooms endpoint
      // For now, we'll use a mock or get from reservations
      const response = await api.get('/reservations');
      // Extract unique classrooms from reservations
      const uniqueClassrooms = [...new Set(
        (response.data.data || []).map(r => r.classroom)
      )];
      setClassrooms(uniqueClassrooms);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      alert('Rezervasyon talebi başarıyla oluşturuldu!');
      setShowForm(false);
      setFormData({
        classroom_id: '',
        date: '',
        start_time: '',
        end_time: '',
        purpose: ''
      });
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Rezervasyon oluşturulamadı.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Beklemede', class: 'status-pending' },
      approved: { text: 'Onaylandı', class: 'status-approved' },
      rejected: { text: 'Reddedildi', class: 'status-rejected' },
      cancelled: { text: 'İptal Edildi', class: 'status-cancelled' }
    };
    return badges[status] || { text: status, class: '' };
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="classroom-reservations-page">
          <div className="page-header">
            <h1>Derslik Rezervasyonları</h1>
            <button onClick={() => setShowForm(!showForm)} className="new-reservation-btn">
              {showForm ? 'İptal' : 'Yeni Rezervasyon'}
            </button>
          </div>

          {showForm && (
            <div className="reservation-form-container">
              <h2>Yeni Rezervasyon</h2>
              <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-group">
                  <label>Derslik:</label>
                  <select
                    value={formData.classroom_id}
                    onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                    required
                  >
                    <option value="">Derslik Seçin</option>
                    {classrooms.map(classroom => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.building} {classroom.room_number} (Kapasite: {classroom.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tarih:</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Başlangıç Saati:</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Bitiş Saati:</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Amaç:</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    rows={3}
                    placeholder="Rezervasyon amacını açıklayın..."
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Rezerve Et</button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cancel-btn"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : (
            <div className="reservations-list">
              {reservations.length === 0 ? (
                <div className="no-reservations">Rezervasyon bulunmamaktadır.</div>
              ) : (
                reservations.map(reservation => {
                  const statusBadge = getStatusBadge(reservation.status);
                  return (
                    <div key={reservation.id} className="reservation-card">
                      <div className="reservation-header">
                        <div>
                          <h3>
                            {reservation.classroom?.building} {reservation.classroom?.room_number}
                          </h3>
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
                          <strong>Saat:</strong> {reservation.start_time} - {reservation.end_time}
                        </div>
                        <div className="detail-item">
                          <strong>Amaç:</strong> {reservation.purpose}
                        </div>
                        <div className="detail-item">
                          <strong>Kapasite:</strong> {reservation.classroom?.capacity} kişi
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClassroomReservationsPage;


