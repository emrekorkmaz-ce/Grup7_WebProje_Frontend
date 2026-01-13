import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { BookIcon, UserIcon, EditIcon } from '../components/Icons';
import './CourseAssignmentPage.css';

const CourseAssignmentPage = () => {
  const { t, language } = useTranslation();
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState({});
  const [selectedInstructors, setSelectedInstructors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, facultyRes] = await Promise.all([
        api.get('/admin/sections'),
        api.get('/admin/faculty')
      ]);
      
      setSections(sectionsRes.data.data || []);
      setFaculty(facultyRes.data.data || []);
      setError('');
      
      // Initialize selected instructors
      const initialSelections = {};
      sectionsRes.data.data?.forEach(section => {
        initialSelections[section.id] = section.instructorId || '';
      });
      setSelectedInstructors(initialSelections);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(language === 'en' 
        ? 'Failed to load course sections.' 
        : 'Ders şubeleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorChange = (sectionId, instructorId) => {
    setSelectedInstructors(prev => ({
      ...prev,
      [sectionId]: instructorId
    }));
  };

  const handleAssign = async (sectionId) => {
    const instructorId = selectedInstructors[sectionId];
    
    if (!instructorId) {
      alert(language === 'en' 
        ? 'Please select an instructor.' 
        : 'Lütfen bir akademisyen seçin.');
      return;
    }

    try {
      setAssigning(prev => ({ ...prev, [sectionId]: true }));
      
      await api.post('/admin/assign-instructor', {
        sectionId,
        instructorId
      });

      // Refresh data
      await fetchData();
      
      alert(language === 'en' 
        ? 'Instructor assigned successfully!' 
        : 'Akademisyen başarıyla atandı!');
    } catch (err) {
      console.error('Error assigning instructor:', err);
      alert(language === 'en' 
        ? 'Failed to assign instructor.' 
        : 'Akademisyen atanamadı.');
    } finally {
      setAssigning(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleRemove = async (sectionId) => {
    if (!window.confirm(language === 'en' 
      ? 'Are you sure you want to remove the instructor?' 
      : 'Akademisyeni kaldırmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      setAssigning(prev => ({ ...prev, [sectionId]: true }));
      
      await api.post('/admin/assign-instructor', {
        sectionId,
        instructorId: null
      });

      // Refresh data
      await fetchData();
      
      alert(language === 'en' 
        ? 'Instructor removed successfully!' 
        : 'Akademisyen başarıyla kaldırıldı!');
    } catch (err) {
      console.error('Error removing instructor:', err);
      alert(language === 'en' 
        ? 'Failed to remove instructor.' 
        : 'Akademisyen kaldırılamadı.');
    } finally {
      setAssigning(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const getSemesterText = (semester) => {
    if (semester === 'fall' || semester === 'FALL') {
      return language === 'en' ? 'Fall' : 'Güz';
    } else if (semester === 'spring' || semester === 'SPRING') {
      return language === 'en' ? 'Spring' : 'Bahar';
    }
    return semester;
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main>
          <div className="course-assignment-page">
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
        <div className="course-assignment-page">
          <div className="page-header">
            <h1>{language === 'en' ? 'Course Assignment' : 'Ders Atama'}</h1>
            <p className="page-subtitle">
              {language === 'en' 
                ? 'Assign instructors to course sections' 
                : 'Akademisyenleri ders şubelerine atayın'}
            </p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="sections-grid">
            {sections.map((section) => (
              <div key={section.id} className="section-card">
                <div className="section-header">
                  <div className="section-info">
                    <h3 className="course-code">{section.courseCode}</h3>
                    <p className="course-name">{section.courseName}</p>
                    <div className="section-details">
                      <span className="section-badge">
                        {language === 'en' ? 'Section' : 'Şube'}: {section.sectionNumber}
                      </span>
                      <span className="semester-badge">
                        {getSemesterText(section.semester)} {section.year}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="section-body">
                  {section.instructor ? (
                    <div className="current-instructor">
                      <div className="instructor-info">
                        <UserIcon size={16} />
                        <span className="instructor-name">{section.instructor.name}</span>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(section.id)}
                        disabled={assigning[section.id]}
                      >
                        {assigning[section.id] 
                          ? (language === 'en' ? 'Removing...' : 'Kaldırılıyor...')
                          : (language === 'en' ? 'Remove' : 'Kaldır')}
                      </button>
                    </div>
                  ) : (
                    <div className="no-instructor">
                      <span className="no-instructor-text">
                        {language === 'en' ? 'No instructor assigned' : 'Akademisyen atanmadı'}
                      </span>
                    </div>
                  )}

                  <div className="assignment-controls">
                    <select
                      className="instructor-select"
                      value={selectedInstructors[section.id] || ''}
                      onChange={(e) => handleInstructorChange(section.id, e.target.value)}
                      disabled={assigning[section.id]}
                    >
                      <option value="">
                        {language === 'en' ? 'Select instructor...' : 'Akademisyen seçin...'}
                      </option>
                      {faculty.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.email})
                        </option>
                      ))}
                    </select>
                    
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAssign(section.id)}
                      disabled={assigning[section.id] || !selectedInstructors[section.id] || selectedInstructors[section.id] === section.instructorId}
                    >
                      {assigning[section.id] 
                        ? (language === 'en' ? 'Assigning...' : 'Atanıyor...')
                        : (language === 'en' ? 'Assign' : 'Ata')}
                    </button>
                  </div>

                  <div className="section-stats">
                    <span>
                      {language === 'en' ? 'Capacity' : 'Kapasite'}: {section.capacity}
                    </span>
                    <span>
                      {language === 'en' ? 'Enrolled' : 'Kayıtlı'}: {section.enrolledCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sections.length === 0 && (
            <div className="empty-state">
              <BookIcon size={48} />
              <p>{language === 'en' ? 'No course sections found.' : 'Ders şubesi bulunamadı.'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseAssignmentPage;
