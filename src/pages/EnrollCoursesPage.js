import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './EnrollCoursesPage.css';

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
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)' }}>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <main style={{ flex: 1, padding: '2rem', marginLeft: 250 }}>
                    <div className="enroll-courses-page">
                        <h2 style={{ color: '#fff', marginBottom: '2rem' }}>Ders Seçimi</h2>

                        {loading && <div style={{ color: '#fff' }}>Yükleniyor...</div>}
                        {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</div>}

                        {!loading && courses.length === 0 && (
                            <div style={{ color: '#ccc' }}>Şu anda kayıt için uygun ders bulunamadı.</div>
                        )}

                        {!loading && courses.length > 0 && (
                            <div className="courses-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                                {courses.map((course) => (
                                    <div key={course.sectionId} className="course-card" style={{
                                        background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        transition: 'transform 0.2s',
                                    }}>
                                        <h3 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>{course.courseCode}</h3>
                                        <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>{course.courseName}</h4>
                                        <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>Bölüm:</strong> {course.sectionNumber}
                                        </div>
                                        <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>Öğretim Üyesi:</strong> {course.instructorName || 'Belirtilmemiş'}
                                        </div>
                                        <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>Kontenjan:</strong> {course.enrolledCount}/{course.capacity}
                                        </div>
                                        <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                            <strong>Kredi:</strong> {course.credits}
                                        </div>
                                        <button
                                            onClick={() => handleEnroll(course.sectionId)}
                                            disabled={enrolling === course.sectionId || course.enrolledCount >= course.capacity}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: enrolling === course.sectionId ? '#666' : (course.enrolledCount >= course.capacity ? '#666' : '#4CAF50'),
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                cursor: (enrolling === course.sectionId || course.enrolledCount >= course.capacity) ? 'not-allowed' : 'pointer',
                                                transition: 'background-color 0.3s',
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
        </div>
    );
};

export default EnrollCoursesPage;
