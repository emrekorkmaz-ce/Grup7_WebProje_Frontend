
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { UserIcon, BookIcon, CheckCircleIcon, ClockIcon } from '../components/Icons';
// import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (authLoading) {
      return;
    }

    // User yoksa loading'i false yap ve çık
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        
        // Kullanıcı rolüne göre farklı endpoint kullan
        if (user.role === 'faculty' || user.role === 'admin') {
          // Akademisyen ve admin için faculty/sections endpoint'i
          console.log('Fetching faculty sections for user:', user.role, user.email);
          response = await api.get('/faculty/sections');
          console.log('Full API response:', response);
          console.log('Response data:', response.data);
          console.log('Response data.data:', response.data?.data);
          
          // Response formatını kontrol et - backend { success: true, data: [...] } formatında döner
          let sections = [];
          if (response.data) {
            if (response.data.success && Array.isArray(response.data.data)) {
              sections = response.data.data;
            } else if (Array.isArray(response.data.data)) {
              sections = response.data.data;
            } else if (Array.isArray(response.data)) {
              sections = response.data;
            }
          }
          
          console.log('Parsed sections count:', sections.length);
          console.log('First section:', sections[0]);
          
          // Sections'ı courses formatına dönüştür
          const formattedCourses = sections.map(section => ({
            id: section.id,
            code: section.courseCode || section.courses?.code || 'N/A',
            name: section.courseName || section.courses?.name || 'N/A',
            sectionNumber: section.sectionNumber || section.section_number,
            sectionName: `${t('common.section')} ${section.sectionNumber || section.section_number}`,
            instructorName: section.instructor?.fullName || '-',
            status: 'active',
            statusText: t('common.active'),
            semester: section.semester,
            year: section.year,
            enrolledCount: section.enrolledCount || section.enrolled_count || 0,
            capacity: section.capacity || 0
          }));
          
          console.log('Formatted courses count:', formattedCourses.length);
          setCourses(formattedCourses);
        } else {
          // Öğrenci için student/my-courses endpoint'i
          console.log('Fetching student courses');
          response = await api.get('/student/my-courses');
          console.log('Student courses response:', response.data);
          const coursesData = response.data?.data || response.data || [];
          setCourses(coursesData);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        console.error('Error response:', err.response);
        console.error('Error message:', err.message);
        setError(err.response?.data?.error || err.response?.data?.message || err.message || t('courses.coursesLoadError'));
        setCourses([]); // Hata durumunda boş array set et
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };
    
    fetchMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, authLoading]); // Sadece user.id ve role değiştiğinde çalışsın

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <h2 className="mb-4">{t('courses.registeredCourses')}</h2>

        {(loading || authLoading) ? (
          <div className="loading">{t('courses.coursesLoading')}</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : !user ? (
          <div className="card text-center p-4">{t('common.pleaseLogin') || 'Lütfen giriş yapın'}</div>
        ) : courses.length === 0 ? (
          <div className="card text-center p-4">{t('courses.noCourses')}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                className="card"
                onClick={() => handleCourseClick(course.id)}
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
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
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} /> {course.instructorName}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookIcon size={16} /> {t('common.section')}: {course.sectionName || course.sectionNumber}
                  </div>
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
                    {course.statusText || course.status || t('common.active')}
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
