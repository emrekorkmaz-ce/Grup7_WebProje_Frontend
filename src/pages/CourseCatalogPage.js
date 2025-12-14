import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CourseCatalogPage.css';

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    // eslint-disable-next-line
  }, [filters.page, filters.department]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses', { params: filters });
      setCourses(response.data.data.courses);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setCourses([]);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data.departments);
    } catch (err) {
      setDepartments([]);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleDepartment = (e) => {
    setFilters({ ...filters, department: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="course-catalog-page">
      <h2>Ders Kataloğu</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Ders kodu veya adı ara..."
          value={filters.search}
          onChange={handleSearch}
        />
        <select value={filters.department} onChange={handleDepartment}>
          <option value="">Tüm Bölümler</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="course-list">
          {courses.length === 0 ? (
            <div className="no-courses">Ders bulunamadı.</div>
          ) : (
            courses.map((course) => (
              <div className="course-card" key={course.id}>
                <div className="course-header">
                  <span className="course-code">{course.code}</span>
                  <span className="course-name">{course.name}</span>
                </div>
                <div className="course-meta">
                  <span>Kredi: {course.credits}</span>
                  <span>ECTS: {course.ects}</span>
                  <span>Bölüm: {course.department?.name}</span>
                </div>
                <a className="detail-link" href={`/courses/${course.id}`}>Detay</a>
              </div>
            ))
          )}
        </div>
      )}
      <div className="pagination">
        {Array.from({ length: pagination.totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={pagination.page === i + 1 ? 'active' : ''}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseCatalogPage;
