import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyCoursesPage.css';

const MyCoursesPage = () => {
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
        setError('Dersler yüklenemedi.');
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
    <div className="my-courses-page">
      <h2>Kayıtlı Derslerim</h2>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : courses.length === 0 ? (
        <div className="no-courses">Kayıtlı dersiniz yok.</div>
      ) : (
        <div className="courses-list">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`course-card status-${course.status}`}
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="course-title">{course.code} - {course.name}</div>
              <div className="course-status">
                Durum: <span className={`status-label status-${course.status}`}>{course.statusText || course.status}</span>
              </div>
              <div className="course-instructor">Öğretim Üyesi: {course.instructorName}</div>
              <div className="course-section">Şube: {course.sectionName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
