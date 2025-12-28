import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './MySchedulePage.css';

const MySchedulePage = () => {
  const { t, language } = useTranslation();
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
      setError(language === 'en' ? 'Failed to load schedule.' : 'Program yüklenemedi.');
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
      alert(language === 'en' ? 'Failed to download iCal file.' : 'iCal dosyası indirilemedi.');
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: t('schedule.monday'),
    tuesday: t('schedule.tuesday'),
    wednesday: t('schedule.wednesday'),
    thursday: t('schedule.thursday'),
    friday: t('schedule.friday'),
    saturday: t('schedule.saturday'),
    sunday: t('schedule.sunday')
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="my-schedule-page">
      <div className="schedule-header">
        <h1>{t('schedule.mySchedule')}</h1>
        <button onClick={handleExportICal} className="export-btn">
          {language === 'en' ? 'Download as iCal' : 'iCal Olarak İndir'}
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
                          {t('common.section')} {item.section_number}
                        </div>
                        <div className="schedule-classroom">
                          {item.classroom.building} {item.classroom.room_number}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-class">{language === 'en' ? 'No class' : 'Ders yok'}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {schedule && Object.values(schedule).every(day => !day || day.length === 0) && (
        <div className="no-schedule">
          {t('schedule.noSchedule')}
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default MySchedulePage;


