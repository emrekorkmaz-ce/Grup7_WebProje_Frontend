import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';

const EnrollCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(null);
    const { t, language } = useTranslation();

    useEffect(() => {
        fetchAvailableCourses();
    }, []);

    const fetchAvailableCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            // API endpoint for available courses/sections (only with assigned instructors)
            const response = await api.get('/student/available-courses');
            setCourses(response.data);
        } catch (err) {
            setError(language === 'en' 
                ? 'Failed to load courses: ' + (err.response?.data?.error || err.message)
                : 'Dersler yüklenemedi: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (sectionId) => {
        try {
            setEnrolling(sectionId);
            const response = await api.post('/student/enroll', { sectionId });
            alert(language === 'en' 
                ? 'Enrollment request sent successfully. Waiting for instructor approval.'
                : 'Kayıt isteği başarıyla gönderildi. Akademisyen onayı bekleniyor.');
            fetchAvailableCourses(); // Refresh list
        } catch (err) {
            alert(language === 'en' 
                ? 'Enrollment request failed: ' + (err.response?.data?.error || err.message)
                : 'Kayıt isteği başarısız: ' + (err.response?.data?.error || err.message));
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
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>
                        {language === 'en' ? 'Course Selection' : 'Ders Seçimi'}
                    </h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {language === 'en' 
                            ? 'Select a course to send an enrollment request to the instructor. The instructor will review and approve your request.'
                            : 'Ders seçerek akademisyene kayıt isteği gönderin. Akademisyen isteğinizi inceleyip onaylayacaktır.'}
                    </p>

                    {loading && (
                        <div className="loading">
                            {language === 'en' ? 'Loading courses...' : 'Yükleniyor...'}
                        </div>
                    )}
                    {error && <div className="error">{error}</div>}

                    {!loading && courses.length === 0 && (
                        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                            {language === 'en' 
                                ? 'No courses available for enrollment at the moment. Only courses with assigned instructors are shown.'
                                : 'Şu anda kayıt için uygun ders bulunamadı. Sadece akademisyene atanan dersler gösterilmektedir.'}
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
                                            <strong>{language === 'en' ? 'Section:' : 'Şube:'}</strong> {course.sectionNumber}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                            <strong>{language === 'en' ? 'Instructor:' : 'Öğretim Üyesi:'}</strong> {course.instructorName || (language === 'en' ? 'Not specified' : 'Belirtilmemiş')}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                            <strong>{language === 'en' ? 'Capacity:' : 'Kontenjan:'}</strong> {course.enrolledCount}/{course.capacity}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                            <strong>{language === 'en' ? 'Semester:' : 'Dönem:'}</strong> {course.year} - {course.semester ? (course.semester.charAt(0).toUpperCase() + course.semester.slice(1)) : ''}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                            <strong>{language === 'en' ? 'Credits:' : 'Kredi:'}</strong> {course.credits}
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
                                        {enrolling === course.sectionId 
                                            ? (language === 'en' ? 'Sending...' : 'Gönderiliyor...')
                                            : (course.enrolledCount >= course.capacity 
                                                ? (language === 'en' ? 'Full' : 'Kontenjan Dolu')
                                                : (language === 'en' ? 'Send Enrollment Request' : 'Kayıt İsteği Gönder'))}
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
