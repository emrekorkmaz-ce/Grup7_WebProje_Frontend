
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { UserIcon, BookIcon, CheckCircleIcon, ClockIcon } from '../components/Icons';
// import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/student/my-courses');
        setCourses(response.data);
      } catch (err) {
        setError(t('courses.coursesLoadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <h2 className="mb-4">{t('courses.registeredCourses')}</h2>

        {loading ? (
          <div className="loading">{t('courses.coursesLoading')}</div>
        ) : error ? (
          <div className="error">{error}</div>
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
