import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';

const CourseCatalogPage = () => {
  const { t, language } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 20
  });

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, [filters.department, pagination.page]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const depts = response.data.data || response.data || [];
      setDepartments(depts);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      const coursesData = response.data.data || response.data || [];
      
      // Filter courses
      let filtered = coursesData;
      
      if (filters.search) {
        filtered = filtered.filter(course => 
          course.code.toLowerCase().includes(filters.search.toLowerCase()) ||
          course.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.department) {
        filtered = filtered.filter(course => 
          course.department_id === filters.department
        );
      }

      // Calculate pagination
      const totalPages = Math.ceil(filtered.length / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const paginatedCourses = filtered.slice(startIndex, startIndex + pagination.limit);

      setCourses(paginatedCourses);
      setPagination(prev => ({ ...prev, totalPages }));
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleDepartment = (e) => {
    setFilters({ ...filters, department: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>{t('courses.courseCatalog')}</h2>

          <div className="filters" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder={t('courses.searchCourse')}
              value={filters.search}
              onChange={handleSearch}
              className="form-input"
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
            />
            <select
              value={filters.department}
              onChange={handleDepartment}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}
            >
              <option value="">Tüm Bölümler</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : (
            <div className="course-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Ders bulunamadı.</div>
              ) : (
                courses.map((course) => {
                  const department = departments.find(d => d.id === course.department_id);
                  return (
                    <div key={course.id} style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(15, 76, 129, 0.1)',
                            color: 'var(--accent-color)',
                            fontWeight: 700,
                            borderRadius: '999px',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem'
                          }}>
                            {course.code}
                          </span>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{course.name}</h3>
                        </div>
                        <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '6px', background: 'var(--accent-color)', color: 'white' }}>Detay</Link>
                      </div>

                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span><strong>Kredi:</strong> {course.credits}</span>
                        <span><strong>ECTS:</strong> {course.credits * 1.5}</span>
                        <span><strong>Bölüm:</strong> {department?.name || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border-color)',
                    background: pagination.page === i + 1 ? 'var(--accent-color)' : 'white',
                    color: pagination.page === i + 1 ? 'white' : 'var(--text-primary)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseCatalogPage;
