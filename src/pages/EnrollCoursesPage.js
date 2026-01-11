import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
const EnrollCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(null);

    useEffect(() => {
        fetchAvailableCourses();
    }, []);

    const fetchAvailableCourses = async () => {
        try {
            setLoading(true);
            // API endpoint for available courses/sections
            const response = await api.get('/student/available-courses');
            setCourses(response.data);
        } catch (err) {
            setError('Dersler yüklenemedi: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (sectionId) => {
        try {
            setEnrolling(sectionId);
            await api.post('/student/enroll', { sectionId });
            alert('Derse başarıyla kayıt oldunuz!');
            fetchAvailableCourses(); // Refresh list
        } catch (err) {
            alert('Kayıt başarısız: ' + (err.response?.data?.error || err.message));
        } finally {
            setEnrolling(null);
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <Sidebar />
            <main>
                <div className="enroll-courses-page">
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>Ders Seçimi</h2>

                    {loading && <div className="loading">Yükleniyor...</div>}
                    {error && <div className="error">{error}</div>}

                    {!loading && courses.length === 0 && (
                        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                            Şu anda kayıt için uygun ders bulunamadı.
                        </div>
                    )}

                    {!loading && courses.length > 0 && (
                        <div className="courses-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                            {courses.map((course) => (
                                <div key={course.sectionId} className="card" style={{
                                    padding: '1.5rem',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}>
                                    <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>{course.courseCode}</h3>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>{course.courseName}</h4>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                            <strong>Bölüm:</strong> {course.sectionNumber}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                            <strong>Öğretim Üyesi:</strong> {course.instructorName || 'Belirtilmemiş'}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                            <strong>Kontenjan:</strong> {course.enrolledCount}/{course.capacity}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                            <strong>Kredi:</strong> {course.credits}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleEnroll(course.sectionId)}
                                        disabled={enrolling === course.sectionId || course.enrolledCount >= course.capacity}
                                        className={enrolling === course.sectionId ? 'btn btn-secondary' : 'btn btn-primary'}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            opacity: (course.enrolledCount >= course.capacity) ? 0.6 : 1,
                                            cursor: (enrolling === course.sectionId || course.enrolledCount >= course.capacity) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {enrolling === course.sectionId ? 'Kaydediliyor...' : (course.enrolledCount >= course.capacity ? 'Kontenjan Dolu' : 'Kayıt Ol')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EnrollCoursesPage;
