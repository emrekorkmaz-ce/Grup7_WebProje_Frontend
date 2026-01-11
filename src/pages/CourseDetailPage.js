import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

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

  if (loading) return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="loading">Yükleniyor...</div>
      </main>
    </div>
  );

  if (!course) return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="error">Ders bulunamadı.</div>
      </main>
    </div>
  );

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            ← Ders Kataloğu
          </Link>

          <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{
                padding: '0.35rem 1rem',
                background: 'rgba(15, 76, 129, 0.1)',
                color: 'var(--accent-color)',
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '1rem'
              }}>
                {course.code}
              </span>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{course.name}</h2>
            </div>
            <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '1rem' }}>
              <span><strong>Kredi:</strong> {course.credits}</span>
              <span><strong>ECTS:</strong> {course.ects}</span>
              <span><strong>Bölüm:</strong> {course.department?.name}</span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Ders Açıklaması</h3>
            {course.description || 'Açıklama girilmemiş.'}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Ön Koşullar</h4>
            {course.prerequisites && course.prerequisites.length > 0 ? (
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-primary)' }}>
                {course.prerequisites.map((pr) => (
                  <li key={pr.id}>
                    <Link to={`/courses/${pr.id}`} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>{pr.code} - {pr.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Ön koşul yok.</div>
            )}
          </div>

          <div className="sections">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Açılan Şubeler</h4>
            {course.sections && course.sections.length > 0 ? (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Şube</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Dönem</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Yıl</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Öğretim Üyesi</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Kapasite</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Kayıtlı</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Sınıf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.sections.map((section) => (
                      <tr key={section.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{section.sectionNumber}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{section.semester}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{section.year}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{section.instructor?.fullName}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{section.capacity}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{section.enrolledCount}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{section.classroom ? `${section.classroom.building} ${section.classroom.roomNumber}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Şube bulunamadı.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetailPage;
