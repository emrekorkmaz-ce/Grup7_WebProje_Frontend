
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './GradesPage.css';

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', marginLeft: 250 }}>
          <div className="grades-page">
            <h2>Notlarım</h2>
            <div className="gpa-summary">
              <div>GNO: <span>{gpa !== null ? gpa : '-'}</span></div>
              <div>AGNO: <span>{cgpa !== null ? cgpa : '-'}</span></div>
              <button className="transcript-btn" onClick={handleTranscriptDownload}>Transkript İndir</button>
            </div>
            {loading ? (
              <div className="loading">Yükleniyor...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : grades.length === 0 ? (
              <div className="no-grades">Henüz notunuz bulunmamaktadır.</div>
            ) : (
              <table className="grades-table">
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
                      <td>{grade.courseCode}</td>
                      <td>{grade.courseName}</td>
                      <td>{grade.credits}</td>
                      <td>{grade.letterGrade}</td>
                      <td>{grade.score}</td>
                      <td>{grade.semesterName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GradesPage;
