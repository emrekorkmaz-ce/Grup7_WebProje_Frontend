
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { DownloadIcon } from '../components/Icons';
// import './GradesPage.css';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpa, setGpa] = useState(null);
  const [cgpa, setCgpa] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/student/grades');
        setGrades(response.data.grades || []);
        setGpa(response.data.gpa);
        setCgpa(response.data.cgpa);
      } catch (err) {
        setError('Notlar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const handleTranscriptDownload = async () => {
    try {
      const response = await api.get('/student/transcript', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transkript.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Transkript indirilemedi.');
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2>Notlarım</h2>
            <button className="btn btn-secondary" onClick={handleTranscriptDownload}>
              <DownloadIcon size={16} /> Transkript İndir
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dönem Ortalaması (GNO)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{gpa !== null ? gpa : '-'}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Genel Ortalama (AGNO)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{cgpa !== null ? cgpa : '-'}</div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Notlar yükleniyor...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : grades.length === 0 ? (
            <div className="text-center p-4">Henüz not girişi yapılmamış.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ders Kodu</th>
                    <th>Ders Adı</th>
                    <th>Kredi</th>
                    <th>Harf Notu</th>
                    <th>Puan</th>
                    <th>Dönem</th>
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
