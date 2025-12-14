import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './GiveAttendancePage.css';

const GiveAttendancePage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Cihazınızda konum servisi bulunamadı.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('Konum alınamadı. Lütfen izin verin.');
        setLoading(false);
      }
    );
  }, []);

  const handleGiveAttendance = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/student/attendance/give/${sessionId}`, { location });
      setSuccess(true);
    } catch (err) {
      setError('Yoklama verilemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="give-attendance-page"><h2>Yoklama Başarılı!</h2><div>Yoklamanız başarıyla kaydedildi.</div></div>;
  }

  return (
    <div className="give-attendance-page">
      <h2>Yoklama Ver</h2>
      {loading ? (
        <div className="loading">Konum alınıyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="location-info">
            Konumunuz: {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Alınamadı'}
          </div>
          <button className="give-btn" onClick={handleGiveAttendance} disabled={!location || loading}>
            Yoklama Ver
          </button>
        </>
      )}
    </div>
  );
};

export default GiveAttendancePage;
