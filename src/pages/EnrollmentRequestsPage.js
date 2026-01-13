import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { CheckIcon, XIcon } from '../components/Icons';

const EnrollmentRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, language } = useTranslation();

  useEffect(() => {
    fetchEnrollmentRequests();
  }, []);

  const fetchEnrollmentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/faculty/enrollment-requests');
      setRequests(response.data || []);
    } catch (err) {
      console.error('Error fetching enrollment requests:', err);
      setError(language === 'en' 
        ? 'Failed to load enrollment requests: ' + (err.response?.data?.error || err.message)
        : 'Kayıt istekleri yüklenemedi: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (enrollmentId, action) => {
    try {
      await api.post(`/faculty/enrollment-requests/${enrollmentId}/${action}`);
      alert(language === 'en' 
        ? `Enrollment request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
        : `Kayıt isteği başarıyla ${action === 'approve' ? 'onaylandı' : 'reddedildi'}.`);
      fetchEnrollmentRequests(); // Refresh list
    } catch (err) {
      alert(language === 'en' 
        ? `Failed to ${action} request: ` + (err.response?.data?.error || err.message)
        : `İstek ${action === 'approve' ? 'onaylanamadı' : 'reddedilemedi'}: ` + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>
            {language === 'en' ? 'Enrollment Requests' : 'Kayıt İstekleri'}
          </h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {language === 'en' 
              ? 'Review and approve or reject student enrollment requests for your courses.'
              : 'Dersleriniz için öğrenci kayıt isteklerini inceleyin ve onaylayın veya reddedin.'}
          </p>

          {loading && (
            <div className="loading">
              {language === 'en' ? 'Loading enrollment requests...' : 'Kayıt istekleri yükleniyor...'}
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {!loading && !error && requests.length === 0 && (
            <div style={{ 
              color: 'var(--text-secondary)', 
              padding: '2rem', 
              textAlign: 'center', 
              background: 'white', 
              borderRadius: '8px', 
              border: '1px dashed var(--border-color)' 
            }}>
              {language === 'en' 
                ? 'No pending enrollment requests.'
                : 'Bekleyen kayıt isteği bulunmamaktadır.'}
            </div>
          )}

          {!loading && !error && requests.length > 0 && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
                        {request.courseCode} - {request.courseName}
                      </h3>
                      {request.sectionNumber && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                          <strong>{language === 'en' ? 'Section:' : 'Şube:'}</strong> {request.sectionNumber}
                        </div>
                      )}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        <strong>{language === 'en' ? 'Student:' : 'Öğrenci:'}</strong> {request.studentName}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        <strong>{language === 'en' ? 'Student Number:' : 'Öğrenci Numarası:'}</strong> {request.studentNumber}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <strong>{language === 'en' ? 'Request Date:' : 'İstek Tarihi:'}</strong> {new Date(request.enrollmentDate || request.requestDate).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleRequest(request.id, 'approve')}
                        className="btn btn-primary"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        <CheckIcon size={16} />
                        {language === 'en' ? 'Approve' : 'Onayla'}
                      </button>
                      <button
                        onClick={() => handleRequest(request.id, 'reject')}
                        className="btn btn-secondary"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        <XIcon size={16} />
                        {language === 'en' ? 'Reject' : 'Reddet'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EnrollmentRequestsPage;

