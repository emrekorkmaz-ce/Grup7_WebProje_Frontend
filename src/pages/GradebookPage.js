import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './GradebookPage.css';

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
      alert('Notlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gradebook-page">
      <h2>Not Defteri</h2>
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <table className="gradebook-table">
            <thead>
              <tr>
                <th>Öğrenci No</th>
                <th>Ad Soyad</th>
                <th>Not (Harf/Puan)</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.studentId}>
                  <td>{student.studentNumber}</td>
                  <td>{student.fullName}</td>
                  <td>
                    <input
                      type="text"
                      value={grades[student.studentId] || ''}
                      onChange={e => handleGradeChange(student.studentId, e.target.value)}
                      className="grade-input"
                      placeholder="AA / 100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </form>
      )}
    </div>
  );
};

export default GradebookPage;
