import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { DownloadIcon, BookIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './GradesPage.css';

const GradesPage = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpa, setGpa] = useState(null);
  const [cgpa, setCgpa] = useState(null);

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchFacultySections();
    } else if (user?.role === 'student') {
      fetchStudentGrades();
    }
  }, [user, language]);

  const fetchStudentGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/student/grades');
      setGrades(response.data.grades || []);
      setGpa(response.data.gpa);
      setCgpa(response.data.cgpa);
    } catch (err) {
      setError(language === 'en' ? 'Failed to load grades.' : 'Notlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultySections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/faculty/sections');
      setSections(response.data.data || response.data || []);
    } catch (err) {
      setError(t('courses.coursesLoadError'));
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptDownload = async () => {
    try {
      const response = await api.get('/student/transcript', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', language === 'en' ? 'transcript.xlsx' : 'transkript.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Transcript download error:', err);
      alert(language === 'en' 
        ? 'Failed to download transcript: ' + (err.response?.data?.error || err.message)
        : 'Transkript indirilemedi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSectionClick = (sectionId) => {
    navigate(`/gradebook/${sectionId}`);
  };

  // Akademisyen görünümü
  if (user?.role === 'faculty') {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2>{t('grades.title')}</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {t('grades.titleDesc')}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading">{t('grades.sectionsLoading')}</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : sections.length === 0 ? (
              <div className="text-center p-4">{language === 'en' ? 'No courses assigned to you yet.' : 'Henüz size atanmış ders bulunmamaktadır.'}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className="section-card"
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      background: 'var(--card-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'var(--accent-color)'
                    }}></div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(15, 76, 129, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BookIcon size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {section.courses?.code || section.courseCode || 'N/A'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {section.courses?.name || section.courseName || 'Ders Adı'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{t('common.section')}:</strong></span>
                        <span>{section.section_number || section.sectionNumber || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{language === 'en' ? 'Semester:' : 'Dönem:'}</strong></span>
                        <span>{section.semester === 'fall' ? t('courseAssignment.fall') : section.semester === 'spring' ? t('courseAssignment.spring') : section.semester || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{language === 'en' ? 'Year:' : 'Yıl:'}</strong></span>
                        <span>{section.year || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{language === 'en' ? 'Enrolled Students:' : 'Kayıtlı Öğrenci:'}</strong></span>
                        <span>{section.enrolled_count || section.enrolledCount || 0}</span>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--glass-border)',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: 'var(--accent-color)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        {language === 'en' ? 'Enter Grades →' : 'Not Girişi Yap →'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Öğrenci görünümü
  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2>{language === 'en' ? 'My Grades' : 'Notlarım'}</h2>
            <button className="btn btn-secondary" onClick={handleTranscriptDownload}>
              <DownloadIcon size={16} /> {t('grades.downloadTranscript')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="gpa-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{language === 'en' ? 'Semester GPA (GPA)' : 'Dönem Ortalaması (GNO)'}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                {gpa !== null ? parseFloat(gpa).toFixed(2) : '-'}
              </div>
            </div>
            <div className="gpa-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{language === 'en' ? 'Overall GPA (CGPA)' : 'Genel Ortalama (AGNO)'}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>
                {cgpa !== null ? parseFloat(cgpa).toFixed(2) : '-'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">{language === 'en' ? 'Loading grades...' : 'Notlar yükleniyor...'}</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : grades.length === 0 ? (
            <div className="text-center p-4">{language === 'en' ? 'No grades entered yet.' : 'Henüz not girişi yapılmamış.'}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('courses.courseCode')}</th>
                    <th>{t('courses.courseName')}</th>
                    <th>{t('courses.credits')}</th>
                    <th>{t('grades.letterGrade')}</th>
                    <th>{language === 'en' ? 'Score' : 'Puan'}</th>
                    <th>{language === 'en' ? 'Semester' : 'Dönem'}</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.sectionId}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{grade.courseCode}</td>
                      <td>{grade.courseName}</td>
                      <td>{grade.credits}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: grade.letterGrade?.startsWith('A') ? 'var(--success)' :
                            grade.letterGrade?.startsWith('F') ? 'var(--danger)' : 'var(--text-primary)'
                        }}>
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td>{grade.score}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{grade.semesterName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GradesPage;
