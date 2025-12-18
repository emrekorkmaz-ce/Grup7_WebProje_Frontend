import React, { useEffect, useState } from 'react';
import api from '../services/api';
return (
  <div className="app-container">
    <Navbar />
    <Sidebar />
    <main>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Ders Kataloğu</h2>

        <div className="filters" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Ders kodu veya adı ara..."
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
              courses.map((course) => (
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
                    <a href={`/courses/${course.id}`} className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Detay</a>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span><strong>Kredi:</strong> {course.credits}</span>
                    <span><strong>ECTS:</strong> {course.ects}</span>
                    <span><strong>Bölüm:</strong> {course.department?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
      </div>
    </main>
  </div>
);

export default CourseCatalogPage;
