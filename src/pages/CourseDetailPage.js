import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch (err) {
      setCourse(null);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!course) return <div className="error">Ders bulunamadı.</div>;

  return (
    <div className="course-detail-page">
      <h2>{course.code} - {course.name}</h2>
      <div className="meta">
        <span>Kredi: {course.credits}</span>
        <span>ECTS: {course.ects}</span>
        <span>Bölüm: {course.department?.name}</span>
      </div>
      <div className="desc">{course.description}</div>
      <div className="prerequisites">
        <h4>Ön Koşullar</h4>
        {course.prerequisites && course.prerequisites.length > 0 ? (
          <ul>
            {course.prerequisites.map((pr) => (
              <li key={pr.id}>
                <Link to={`/courses/${pr.id}`}>{pr.code} - {pr.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <span>Yok</span>
        )}
      </div>
      <div className="sections">
        <h4>Açılan Şubeler</h4>
        {course.sections && course.sections.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Şube</th>
                <th>Dönem</th>
                <th>Yıl</th>
                <th>Öğretim Üyesi</th>
                <th>Kapasite</th>
                <th>Kayıtlı</th>
                <th>Sınıf</th>
              </tr>
            </thead>
            <tbody>
              {course.sections.map((section) => (
                <tr key={section.id}>
                  <td>{section.sectionNumber}</td>
                  <td>{section.semester}</td>
                  <td>{section.year}</td>
                  <td>{section.instructor?.fullName}</td>
                  <td>{section.capacity}</td>
                  <td>{section.enrolledCount}</td>
                  <td>{section.classroom ? `${section.classroom.building} ${section.classroom.roomNumber}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span>Şube yok.</span>
        )}
      </div>
      <Link className="back-link" to="/courses">← Ders Kataloğu</Link>
    </div>
  );
};

export default CourseDetailPage;
