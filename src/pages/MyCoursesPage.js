import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { UserIcon, BookIcon, CheckCircleIcon, ClockIcon } from '../components/Icons';
// import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { t, language } = useTranslation();

  useEffect(() => {
    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        // Akademisyen için farklı endpoint
        if (user?.role === 'faculty') {
          response = await api.get('/faculty/sections');
          // Backend'den gelen veriyi frontend formatına çevir
          const formattedCourses = response.data.map(section => ({
            id: section.id,
            code: section.courseCode,
            name: section.courseName,
            sectionNumber: section.sectionNumber,
            sectionName: `${language === 'en' ? 'Section' : 'Şube'} ${section.sectionNumber}`,
            semester: section.semester,
            year: section.year,
            capacity: section.capacity,
            enrolledCount: section.enrolledCount,
            credits: section.credits,
            status: 'active',
            statusText: language === 'en' ? 'Active' : 'Aktif'
          }));
          setCourses(formattedCourses);
        } else {
          // Öğrenci için mevcut endpoint
          response = await api.get('/student/my-courses');
          setCourses(response.data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(language === 'en' 
          ? 'Failed to load courses.' 
          : 'Dersler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchMyCourses();
    }
  }, [user, language]);

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <h2 className="mb-4">
          {language === 'en' ? 'My Courses' : 'Kayıtlı Derslerim'}
        </h2>

        {loading ? (
          <div className="loading">
            {language === 'en' ? 'Loading courses...' : 'Dersler yükleniyor...'}
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : courses.length === 0 ? (
          <div className="card text-center p-4">
            {language === 'en' 
              ? 'You do not have any assigned courses yet.' 
              : 'Henüz atanmış dersiniz bulunmamaktadır.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                className="card"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                  background: 'var(--accent-color)'
                }}></div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {course.code}
                </h3>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', height: '3rem', overflow: 'hidden' }}>
                  {course.name}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {user?.role !== 'faculty' && course.instructorName && (
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} /> {course.instructorName}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookIcon size={16} /> 
                    {language === 'en' ? 'Section' : 'Şube'}: {course.sectionName || course.sectionNumber}
                  </div>
                  {course.year && (
                    <div className="flex items-center gap-2">
                      <ClockIcon size={16} /> 
                      {course.year} - {course.semester ? (course.semester.charAt(0).toUpperCase() + course.semester.slice(1)) : ''}
                    </div>
                  )}
                  {course.capacity && (
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} /> 
                      {course.enrolledCount || 0} / {course.capacity} {language === 'en' ? 'students' : 'öğrenci'}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: course.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: course.status === 'active' ? 'var(--success)' : 'var(--warning)',
                    textTransform: 'uppercase'
                  }}>
                    {course.statusText || course.status || 'Aktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCoursesPage;
