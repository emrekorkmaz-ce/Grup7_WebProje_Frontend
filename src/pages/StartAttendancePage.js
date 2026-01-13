import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { MegaphoneIcon, CheckCircleIcon, CopyIcon, BookIcon, QrCodeIcon } from '../components/Icons';
import './StartAttendancePage.css';

const StartAttendancePage = () => {
  const { t, language } = useTranslation();
  const [qrCode, setQrCode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceUrl, setAttendanceUrl] = useState(null);

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [loadingSections, setLoadingSections] = useState(true);
  const [localIP, setLocalIP] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState(null);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    fetchSections();
    // Local IP'yi algıla (telefon testi için)
    detectLocalIP();
  }, []);

  // Yoklama kayıtlarını periyodik olarak güncelle
  useEffect(() => {
    if (!sessionId) return;
    
    fetchAttendanceRecords(sessionId);
    const intervalId = setInterval(() => {
      fetchAttendanceRecords(sessionId);
    }, 5000); // Her 5 saniyede bir güncelle
    
    return () => clearInterval(intervalId);
  }, [sessionId]);

  const detectLocalIP = async () => {
    try {
      // WebRTC kullanarak local IP'yi bul
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      
      let foundIP = null;
      const timeout = setTimeout(() => {
        if (foundIP) {
          setLocalIP(foundIP);
        }
        pc.close();
      }, 3000);
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const match = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
          if (match) {
            const ip = match[0];
            // Sadece private IP'leri kabul et (public IP'leri reddet)
            const isPrivateIP = ip.startsWith('192.168.') || 
                               ip.startsWith('10.') || 
                               ip.startsWith('172.16.') ||
                               ip.startsWith('172.17.') ||
                               ip.startsWith('172.18.') ||
                               ip.startsWith('172.19.') ||
                               ip.startsWith('172.20.') ||
                               ip.startsWith('172.21.') ||
                               ip.startsWith('172.22.') ||
                               ip.startsWith('172.23.') ||
                               ip.startsWith('172.24.') ||
                               ip.startsWith('172.25.') ||
                               ip.startsWith('172.26.') ||
                               ip.startsWith('172.27.') ||
                               ip.startsWith('172.28.') ||
                               ip.startsWith('172.29.') ||
                               ip.startsWith('172.30.') ||
                               ip.startsWith('172.31.');
            
            if (isPrivateIP && !foundIP) {
              foundIP = ip;
              clearTimeout(timeout);
              setLocalIP(ip);
              pc.close();
            }
          }
        }
      };
      
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
    } catch (err) {
      console.log('Local IP algılanamadı:', err);
    }
  };

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const response = await api.get('/faculty/sections');
      const sectionsList = response.data.data || response.data || [];
      setSections(sectionsList);
      if (sectionsList.length > 0) {
        setSelectedSection(sectionsList[0].id);
      } else {
        setError(language === 'en' ? 'No courses assigned to you.' : 'Size atanmış ders bulunmamaktadır.');
      }
    } catch (err) {
      setError((language === 'en' ? 'Failed to load courses: ' : 'Dersler yüklenemedi: ') + (err.response?.data?.error || err.message));
      setSections([]); // Hata durumunda boş array set et
    } finally {
      setLoadingSections(false);
    }
  };

  const handleStartAttendance = async () => {
    if (!selectedSection) {
      setError(language === 'en' ? 'Please select a course.' : 'Lütfen bir ders seçiniz.');
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

      // URL oluşturma: Production veya local için otomatik algılama
      let baseUrl;
      
      // Production ortamı kontrolü (localhost, 127.0.0.1 veya local IP değilse production)
      const hostname = window.location.hostname;
      const isProduction = hostname !== 'localhost' && 
                          hostname !== '127.0.0.1' &&
                          !hostname.startsWith('192.168.') &&
                          !hostname.startsWith('10.') &&
                          !hostname.startsWith('172.16.') &&
                          !hostname.startsWith('172.17.') &&
                          !hostname.startsWith('172.18.') &&
                          !hostname.startsWith('172.19.') &&
                          !hostname.startsWith('172.20.') &&
                          !hostname.startsWith('172.21.') &&
                          !hostname.startsWith('172.22.') &&
                          !hostname.startsWith('172.23.') &&
                          !hostname.startsWith('172.24.') &&
                          !hostname.startsWith('172.25.') &&
                          !hostname.startsWith('172.26.') &&
                          !hostname.startsWith('172.27.') &&
                          !hostname.startsWith('172.28.') &&
                          !hostname.startsWith('172.29.') &&
                          !hostname.startsWith('172.30.') &&
                          !hostname.startsWith('172.31.');
      
      if (isProduction) {
        // Production: Mevcut origin'i kullan (https://example.com gibi)
        baseUrl = window.location.origin;
      } else {
        // Local: Eğer zaten IP adresi ile erişiliyorsa onu kullan, yoksa algılanan private IP'yi kullan, yoksa localhost
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          // Zaten IP adresi ile erişiliyor
          baseUrl = `http://${hostname}:3000`;
        } else if (localIP) {
          // Algılanan private IP'yi kullan
          baseUrl = `http://${localIP}:3000`;
        } else {
          // Fallback: localhost
          baseUrl = window.location.origin;
        }
      }
      
      const url = `${baseUrl}/attendance/give/${response.data.id}`;
      const newSessionId = response.data.id;
      setSessionId(newSessionId);
      setAttendanceUrl(url);

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      setQrCode(qrCodeUrl);
      
      // Yoklama kayıtlarını hemen yükle ve periyodik olarak güncelle
      fetchAttendanceRecords(newSessionId);
    } catch (err) {
      setError((language === 'en' ? 'Failed to start attendance: ' : 'Yoklama başlatılamadı: ') + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (sessionIdToFetch) => {
    if (!sessionIdToFetch) return;
    
    setLoadingRecords(true);
    try {
      const response = await api.get(`/attendance/sessions/${sessionIdToFetch}/attendance`);
      setAttendanceRecords(response.data.data);
    } catch (err) {
      console.error('Yoklama kayıtları yüklenemedi:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(attendanceUrl);
    alert(language === 'en' ? 'URL copied!' : 'URL kopyalandı!');
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="card">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{t('attendance.startAttendance')}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              {t('attendance.startAttendanceDesc')}
            </p>
          </div>

          {loadingSections ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {t('courses.coursesLoading')}
            </div>
          ) : sections.length === 0 ? (
            <div className="error" style={{ padding: '1.5rem', textAlign: 'center' }}>
              {language === 'en' ? 'No courses assigned to you. Please contact an administrator.' : 'Size atanmış ders bulunmamaktadır. Lütfen admin ile iletişime geçin.'}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}>
                  {t('attendance.selectCourse')}
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="attendance-select"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'var(--input-bg)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-color)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">-- {t('attendance.selectSection')} --</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.courseCode} - {section.courseName} ({t('common.section')} {section.sectionNumber || section.section_number}) - {section.semester === 'fall' || section.semester === 'FALL' ? t('courseAssignment.fall') : section.semester === 'spring' || section.semester === 'SPRING' ? t('courseAssignment.spring') : section.semester} {section.year}
                    </option>
                  ))}
                </select>
                {selectedSection && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.75rem', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {language === 'en' ? 'Selected course:' : 'Seçili ders:'} {sections.find(s => s.id === selectedSection)?.courseCode} - {sections.find(s => s.id === selectedSection)?.courseName}
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleStartAttendance}
                disabled={loading || !selectedSection}
                style={{ 
                  padding: '0.875rem 2rem', 
                  fontSize: '1.1rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>{t('common.loading')}</>
                ) : (
                  <><MegaphoneIcon size={18} /> {language === 'en' ? 'Start Attendance Session' : 'Yoklama Oturumunu Başlat'}</>
                )}
              </button>
            </>
          )}

          {error && !loadingSections && (
            <div className="error mt-4" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}

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
                  <CheckCircleIcon size={24} /> {language === 'en' ? 'Session Active' : 'Oturum Aktif'}
                </h3>
              </div>

              {/* QR CODE - Tahtaya yansıtılacak */}
              {qrCode && (
                <div className="qr-code-container" style={{
                  textAlign: 'center',
                  background: 'var(--card-bg)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '2rem',
                  maxWidth: '400px',
                  margin: '0 auto 2rem auto',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-color)'
                }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCodeIcon size={20} />
                    {language === 'en' ? 'Scan QR Code' : 'QR Kodu Tarayın'}
                  </h3>
                  <img
                    src={qrCode}
                    alt={language === 'en' ? 'Attendance QR Code' : 'Yoklama QR Kodu'}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      borderRadius: '8px',
                      background: 'white',
                      padding: '0.5rem'
                    }}
                  />
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>
                    {language === 'en' ? 'Use phone camera' : 'Telefon kamerasını kullanın'}
                  </p>
                </div>
              )}

              <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{language === 'en' ? 'SESSION ID' : 'OTURUM ID'}</h4>
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
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{language === 'en' ? 'SHAREABLE LINK' : 'PAYLAŞILABİLİR LİNK'}</h4>
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
                    <CopyIcon size={16} /> {language === 'en' ? 'Copy' : 'Kopyala'}
                  </button>
                </div>
              </div>

              {/* YOKLAMA KAYITLARI */}
              {attendanceRecords && (
                <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{language === 'en' ? 'ATTENDANCE RECORDS' : 'YOKLAMA KAYITLARI'}</h4>
                    {loadingRecords && (
                      <div className="spinner sm"></div>
                    )}
                  </div>
                  
                  {attendanceRecords.stats && (
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        flex: 1,
                        minWidth: '120px'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('attendance.totalClasses')}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                          {attendanceRecords.stats.total}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        flex: 1,
                        minWidth: '120px'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('attendance.status.present')}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
                          {attendanceRecords.stats.present}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        flex: 1,
                        minWidth: '120px'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('attendance.status.absent')}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>
                          {attendanceRecords.stats.absent}
                        </div>
                      </div>
                    </div>
                  )}

                  {attendanceRecords.students && attendanceRecords.students.length > 0 ? (
                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0,0,0,0.2)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '2px solid var(--glass-border)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('profile.studentNumber')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('auth.fullName')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('attendance.statusLabel')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{language === 'en' ? 'Check-in Time' : 'Giriş Saati'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceRecords.students.map((student, index) => (
                            <tr key={student.studentId} style={{ borderBottom: index < attendanceRecords.students.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                              <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                {student.studentNumber}
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                {student.fullName}
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                {student.present ? (
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                  }}>
                                    {t('attendance.status.present')}
                                  </span>
                                ) : (
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                  }}>
                                    {t('attendance.status.absent')}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {student.checkInTime ? new Date(student.checkInTime).toLocaleTimeString(language === 'en' ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {t('attendance.noAttendanceRecords')}
                    </div>
                  )}
                </div>
              )}

              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderLeft: '4px solid var(--accent-color)',
                padding: '1.5rem',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0'
              }}>
                <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookIcon size={18} /> {t('attendance.info')}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {t('attendance.infoStep1')}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {t('attendance.infoStep2')}
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
