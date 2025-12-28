import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './ClassroomReservationsPage.css';

const ClassroomReservationsPage = () => {
  const { t, language } = useTranslation();
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
      setError(t('classroomReservations.loadError'));
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await api.get('/reservations/classrooms');
      setClassrooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(t('classroomReservations.classroomsLoadError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      alert(t('classroomReservations.createSuccess'));
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
      alert(err.response?.data?.error || t('classroomReservations.createError'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: t('classroomReservations.status.pending'), class: 'status-pending' },
      approved: { text: t('classroomReservations.status.approved'), class: 'status-approved' },
      rejected: { text: t('classroomReservations.status.rejected'), class: 'status-rejected' },
      cancelled: { text: t('classroomReservations.status.cancelled'), class: 'status-cancelled' }
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
            <h1>{t('classroomReservations.title')}</h1>
            <button onClick={() => setShowForm(!showForm)} className="new-reservation-btn">
              {showForm ? t('classroomReservations.cancel') : t('classroomReservations.newReservation')}
            </button>
          </div>

          {showForm && (
            <div className="reservation-form-container">
              <h2>{t('classroomReservations.newReservation')}</h2>
              <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-group">
                  <label>{t('classroomReservations.classroom')}:</label>
                  <select
                    value={formData.classroom_id}
                    onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                    required
                  >
                    <option value="">{t('classroomReservations.selectClassroom')}</option>
                    {classrooms.map(classroom => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.building} {classroom.room_number} ({t('classroomReservations.capacity')}: {classroom.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('classroomReservations.date')}:</label>
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
                    <label>{t('classroomReservations.startTime')}:</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('classroomReservations.endTime')}:</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('classroomReservations.purpose')}:</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    rows={3}
                    placeholder={t('classroomReservations.purposePlaceholder')}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">{t('classroomReservations.reserve')}</button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cancel-btn"
                  >
                    {t('classroomReservations.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">{t('classroomReservations.loading')}</div>
          ) : (
            <div className="reservations-list">
              {reservations.length === 0 ? (
                <div className="no-reservations">{t('classroomReservations.noReservations')}</div>
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
                          <strong>{t('classroomReservations.time')}:</strong> {reservation.start_time} - {reservation.end_time}
                        </div>
                        <div className="detail-item">
                          <strong>{t('classroomReservations.purpose')}:</strong> {reservation.purpose}
                        </div>
                        <div className="detail-item">
                          <strong>{t('classroomReservations.capacity')}:</strong> {reservation.classroom?.capacity} {t('classroomReservations.people')}
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


