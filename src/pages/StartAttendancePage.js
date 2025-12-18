import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { MegaphoneIcon, CheckCircleIcon, CopyIcon, BookIcon } from '../components/Icons';
// import './StartAttendancePage.css';

const StartAttendancePage = () => {
  const [qrCode, setQrCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceUrl, setAttendanceUrl] = useState(null);

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('/faculty/sections');
      setSections(response.data);
      if (response.data.length > 0) {
        setSelectedSection(response.data[0].id);
      }
    } catch (err) {
      setError('Dersler yüklenemedi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStartAttendance = async () => {
    if (!selectedSection) {
      setError('Lütfen bir ders seçiniz.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        section_id: selectedSection,
        date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        latitude: 41.0082,
        longitude: 28.9784
      };

      console.log('POST PAYLOAD:', payload);
      const response = await api.post('/attendance/sessions', payload);
      console.log('RESPONSE:', response.data);

      const url = `${window.location.origin}/attendance/give/${response.data.id}`;
      setSessionId(response.data.id);
      setAttendanceUrl(url);

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      setQrCode(qrCodeUrl);
    } catch (err) {
      setError('Yoklama başlatılamadı: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceUrl);
    alert('URL kopyalandı!');
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <h2>Yoklama Oturumu Başlat</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Ders Seçimi</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="">Ders Seçiniz</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.courseCode} - {section.courseName} (Şube {section.sectionNumber})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleStartAttendance}
            disabled={loading || !selectedSection}
            style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Başlatılıyor...' : <><MegaphoneIcon size={18} /> Oturumu Başlat</>}
          </button>

          {error && <div className="error mt-4">{error}</div>}

          {sessionId && attendanceUrl && (
            <div className="mt-4 animate-fade-in">
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10b981',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#10b981', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircleIcon size={24} /> Oturum Aktif
                </h3>
              </div>

              {/* QR CODE - Tahtaya yansıtılacak */}
              {qrCode && (
                <div style={{
                  textAlign: 'center',
                  background: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '2rem',
                  maxWidth: '400px',
                  margin: '0 auto 2rem auto',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📱 QR Kodu Tarayın</h3>
                  <img
                    src={qrCode}
                    alt="Yoklama QR Kodu"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      borderRadius: '8px'
                    }}
                  />
                  <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.9rem' }}>
                    Telefon kamerasını kullanın
                  </p>
                </div>
              )}

              <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OTURUM ID</h4>
                <div style={{
                  fontFamily: 'monospace',
                  color: 'var(--accent-color)',
                  fontSize: '1.1rem',
                  letterSpacing: '1px'
                }}>
                  {sessionId}
                </div>
              </div>

              <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>PAYLAŞILABİLİR LİNK</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <code style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    flex: 1,
                    wordBreak: 'break-all',
                    fontSize: '0.9rem',
                    border: '1px solid var(--glass-border)'
                  }}>
                    {attendanceUrl}
                  </code>
                  <button
                    className="btn btn-secondary"
                    onClick={copyToClipboard}
                  >
                    <CopyIcon size={16} /> Kopyala
                  </button>
                </div>
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderLeft: '4px solid var(--accent-color)',
                padding: '1.5rem',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0'
              }}>
                <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookIcon size={18} /> Bilgi
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  1. Bu sayfayı projektör ile tahtaya yansıtın.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  2. Öğrenciler QR kodu tarayarak veya linke tıklayarak yoklama verebilir.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StartAttendancePage;
