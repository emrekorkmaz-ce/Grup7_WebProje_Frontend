import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { BookIcon, UserIcon } from '../components/Icons';

const CourseAssignmentPage = () => {
  const { t, language } = useTranslation();
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sectionsRes, facultyRes] = await Promise.all([
        api.get('/admin/sections'),
        api.get('/admin/faculty')
      ]);
      setSections(sectionsRes.data.data || []);
      setFaculty(facultyRes.data.data || []);
    } catch (err) {
      setError((language === 'en' ? 'Failed to load data: ' : 'Veriler yüklenemedi: ') + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (sectionId, instructorId) => {
    if (!instructorId) {
      alert(language === 'en' ? 'Please select a faculty member' : 'Lütfen bir akademisyen seçin');
      return;
    }

    setAssigning({ ...assigning, [sectionId]: true });
    setSuccessMessage(null);
    setError(null);

    try {
      await api.post('/admin/assign-instructor', {
        sectionId,
        instructorId
      });
      
      setSuccessMessage(t('courseAssignment.assignSuccess'));
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Verileri yenile
      await fetchData();
    } catch (err) {
      setError(t('courseAssignment.assignFailed') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setAssigning({ ...assigning, [sectionId]: false });
    }
  };

  const getSemesterText = (semester) => {
    if (semester === 'fall' || semester === 'FALL') return t('courseAssignment.fall');
    if (semester === 'spring' || semester === 'SPRING') return t('courseAssignment.spring');
    return semester;
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="card">
            <div className="loading">{t('common.loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div style={{ marginBottom: '2rem' }}>
            <h2>{t('courseAssignment.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {t('courseAssignment.titleDesc')}
            </p>
          </div>

          {error && (
            <div className="error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              borderRadius: '8px',
              border: '1px solid #c3e6cb'
            }}>
              {successMessage}
            </div>
          )}

          {sections.length === 0 ? (
            <div className="text-center p-4">{t('courseAssignment.noSections')}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('courses.courseCode')}</th>
                    <th>{t('courses.courseName')}</th>
                    <th>{t('common.section')}</th>
                    <th>{t('courseAssignment.semester')}</th>
                    <th>{language === 'en' ? 'Year' : 'Yıl'}</th>
                    <th>{t('courses.capacity')}</th>
                    <th>{t('courses.enrolled')}</th>
                    <th>{language === 'en' ? 'Current Instructor' : 'Mevcut Akademisyen'}</th>
                    <th>{language === 'en' ? 'Select Instructor' : 'Akademisyen Seç'}</th>
                    <th>{language === 'en' ? 'Action' : 'İşlem'}</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {section.courseCode}
                      </td>
                      <td>{section.courseName}</td>
                      <td>{section.sectionNumber}</td>
                      <td>{getSemesterText(section.semester)}</td>
                      <td>{section.year}</td>
                      <td>{section.capacity}</td>
                      <td>{section.enrolledCount}</td>
                      <td>
                        {section.instructor ? (
                          <span style={{ color: 'var(--accent-color)' }}>
                            {section.instructor.fullName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{t('courseAssignment.notAssigned')}</span>
                        )}
                      </td>
                      <td>
                        <select
                          defaultValue={section.instructor?.id || ''}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            width: '100%',
                            minWidth: '200px'
                          }}
                          onChange={(e) => {
                            const selectedInstructorId = e.target.value;
                            if (selectedInstructorId && selectedInstructorId !== section.instructor?.id) {
                              handleAssign(section.id, selectedInstructorId);
                            }
                          }}
                          disabled={assigning[section.id]}
                        >
                          <option value="">{language === 'en' ? 'Select Instructor' : 'Akademisyen Seçin'}</option>
                          {faculty.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.fullName} ({f.title || (language === 'en' ? 'Faculty' : 'Akademisyen')})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {assigning[section.id] ? (
                          <span style={{ color: 'var(--text-muted)' }}>{language === 'en' ? 'Assigning...' : 'Atanıyor...'}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
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

export default CourseAssignmentPage;


