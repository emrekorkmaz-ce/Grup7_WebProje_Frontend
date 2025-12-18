import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { SaveIcon } from '../components/Icons';

const GradebookPage = () => {
  const { sectionId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const fetchSectionStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/faculty/gradebook/${sectionId}`);
        setStudents(response.data.students || []);
        // Varsayılan olarak mevcut notları doldur
        const initialGrades = {};
        (response.data.students || []).forEach(s => {
          initialGrades[s.studentId] = s.grade || '';
        });
        setGrades(initialGrades);
      } catch (err) {
        console.error('Gradebook load failed:', err);
        setError('Öğrenciler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchSectionStudents();
  }, [sectionId]);

  const handleGradeChange = (studentId, value) => {
    setGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/faculty/gradebook/${sectionId}`, { grades });
      alert('Notlar kaydedildi!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Notlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>Not Girişi</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Öğrenci notlarını buradan girebilirsiniz.</p>
            </div>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem' }}
            >
              {saving ? 'Kaydediliyor...' : <><SaveIcon size={18} /> Kaydet</>}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Öğrenciler yükleniyor...</div>
          ) : error ? (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px' }}>{error}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Öğrenci No</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ad Soyad</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Not (Harf/Puan)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-color)' }}>{student.studentNumber}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{student.fullName}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input
                          type="text"
                          value={grades[student.studentId] || ''}
                          onChange={e => handleGradeChange(student.studentId, e.target.value)}
                          placeholder="AA"
                          style={{
                            background: 'white',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            width: '80px',
                            textAlign: 'center',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Bu dersi alan öğrenci bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main >
    </div >
  );
};

export default GradebookPage;
