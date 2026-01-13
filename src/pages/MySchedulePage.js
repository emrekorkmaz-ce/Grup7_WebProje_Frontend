import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { CalendarIcon, ClockIcon, BuildingIcon } from '../components/Icons';
import './MySchedulePage.css';

const MySchedulePage = () => {
  const { t, language } = useTranslation();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/scheduling/my-schedule');
        const scheduleData = response.data?.data || {};
        
        // Backend'den gelen formatı frontend formatına çevir
        const formattedSchedule = [];
        const dayMap = {
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
          saturday: 'Saturday',
          sunday: 'Sunday'
        };
        
        Object.keys(dayMap).forEach(dayKey => {
          const dayName = dayMap[dayKey];
          const daySchedule = scheduleData[dayKey] || [];
          daySchedule.forEach(item => {
            // Classroom formatını string'e çevir
            let classroomStr = '';
            if (item.classroom) {
              if (typeof item.classroom === 'string') {
                classroomStr = item.classroom;
              } else if (item.classroom.building && item.classroom.room_number) {
                classroomStr = `${item.classroom.building} ${item.classroom.room_number}`;
              }
            }
            
            formattedSchedule.push({
              day: dayName,
              startTime: item.startTime || item.start_time,
              endTime: item.endTime || item.end_time,
              courseCode: item.courseCode || item.course_code,
              courseName: item.courseName || item.course_name,
              section: item.section || item.section_number,
              classroom: classroomStr
            });
          });
        });
        
        setSchedule(formattedSchedule);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError(language === 'en' ? 'Failed to load schedule.' : 'Ders programı yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [language]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daysTr = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  const getDaySchedule = (day) => {
    return schedule.filter(item => {
      const dayName = language === 'en' ? day : daysTr[days.indexOf(day)];
      return item.day === day || item.day === dayName;
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="my-schedule-page">
            <div className="loading-container">
              <div className="loading">{t('common.loading')}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="my-schedule-page">
            <div className="error-message">{error}</div>
          </div>
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
            <div>
              <h1>{language === 'en' ? 'Course Schedule' : 'Ders Programı'}</h1>
              <p className="schedule-subtitle">
                {language === 'en' 
                  ? 'Your weekly course schedule' 
                  : 'Haftalık ders programınız'}
              </p>
            </div>
          </div>

          {schedule.length === 0 ? (
            <div className="schedule-container">
              <div className="no-schedule">
                <CalendarIcon size={48} className="no-class-icon" />
                <p className="no-class-text">
                  {language === 'en' 
                    ? 'No courses scheduled.' 
                    : 'Henüz ders programınız bulunmamaktadır.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="schedule-container">
              <div className="schedule-grid">
                {days.map((day) => {
                  const daySchedule = getDaySchedule(day);
                  const dayName = language === 'en' ? day : daysTr[days.indexOf(day)];
                  
                  return (
                    <div key={day} className="schedule-day">
                      <h3>{dayName}</h3>
                      <div className="schedule-items">
                        {daySchedule.length === 0 ? (
                          <div className="no-class">
                            <CalendarIcon size={24} className="no-class-icon" />
                            <span className="no-class-text">
                              {language === 'en' ? 'No classes' : 'Ders yok'}
                            </span>
                          </div>
                        ) : (
                          daySchedule.map((item, index) => (
                            <div key={index} className="schedule-item">
                              <div className="schedule-time">
                                <ClockIcon size={12} />
                                <span style={{ marginLeft: '4px' }}>
                                  {item.startTime} - {item.endTime}
                                </span>
                              </div>
                              <div className="schedule-course">
                                <strong>{item.courseCode}</strong>
                                <div className="course-name">{item.courseName}</div>
                              </div>
                              {item.section && (
                                <div className="schedule-section">
                                  {language === 'en' ? 'Section' : 'Şube'}: {item.section}
                                </div>
                              )}
                              {item.classroom && (
                                <div className="schedule-classroom">
                                  <BuildingIcon size={12} />
                                  <span>{item.classroom}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MySchedulePage;
