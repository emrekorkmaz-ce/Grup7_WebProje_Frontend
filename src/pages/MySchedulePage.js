import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MySchedulePage.css';

const MySchedulePage = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/scheduling/my-schedule');
      setSchedule(response.data.data);
      setError('');
    } catch (err) {
      setError('Program yüklenemedi.');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportICal = async () => {
    try {
      const response = await api.get('/scheduling/my-schedule/ical', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'schedule.ics');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('iCal dosyası indirilemedi.');
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="my-schedule-page">
      <div className="schedule-header">
        <h1>Ders Programım</h1>
        <button onClick={handleExportICal} className="export-btn">
          iCal Olarak İndir
        </button>
      </div>

      {schedule && (
        <div className="schedule-container">
          <div className="schedule-grid">
            {days.map(day => (
              <div key={day} className="schedule-day">
                <h3>{dayLabels[day]}</h3>
                <div className="schedule-items">
                  {schedule[day] && schedule[day].length > 0 ? (
                    schedule[day].map((item, index) => (
                      <div key={index} className="schedule-item">
                        <div className="schedule-time">
                          {item.start_time} - {item.end_time}
                        </div>
                        <div className="schedule-course">
                          <strong>{item.course_code}</strong>
                          <div className="course-name">{item.course_name}</div>
                        </div>
                        <div className="schedule-section">
                          Bölüm {item.section_number}
                        </div>
                        <div className="schedule-classroom">
                          {item.classroom.building} {item.classroom.room_number}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-class">Ders yok</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {schedule && Object.values(schedule).every(day => !day || day.length === 0) && (
        <div className="no-schedule">
          Henüz programınız oluşturulmamış.
        </div>
      )}
    </div>
  );
};

export default MySchedulePage;


