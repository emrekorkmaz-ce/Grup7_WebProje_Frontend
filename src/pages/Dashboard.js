import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { BookIcon, GraduationCapIcon, CalendarIcon, SettingsIcon, CheckCircleIcon, ClockIcon } from '../components/Icons';
// import './Dashboard.css'; // Removed to fix dark mode override

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const handleAction = (action) => {
    if (action === 'settings') {
      navigate('/profile');
    } else if (action === 'courses') {
      navigate('/my-courses');
    } else if (action === 'grades') {
      navigate('/grades');
    } else if (action === 'schedule') {
      alert('Ders Programı modülü yapım aşamasındadır.');
    } else {
      alert('Bu özellik yapım aşamasındadır.');
    }
  };

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        {/* Header Section */}
        <header className="dashboard-header card" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          backgroundColor: 'white',
          borderLeft: '4px solid var(--accent-color)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              Sayın {formatName(user?.full_name)}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {currentDate}
            </p>
          </div>
          <div className="hidden md:block">
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--accent-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {getInitials(user?.full_name || user?.email)}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

          {/* Profile Summary Card */}
          <div className="card">
            <h3 className="mb-4">Öğrenci Bilgileri</h3>
            <div className="flex flex-col gap-3">
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>E-posta Adresi</span>
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Telefon Numarası</span>
                <span style={{ fontWeight: 500 }}>{user?.phone || '-'}</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  background: user?.is_verified ? 'var(--success-bg)' : 'var(--warning-bg)',
                  color: user?.is_verified ? 'var(--success)' : 'var(--warning)',
                  fontWeight: 600
                }}>
                  {user?.is_verified ? <CheckCircleIcon size={14} /> : <ClockIcon size={14} />}
                  {user?.is_verified ? 'Hesap Doğrulandı' : 'Doğrulama Bekleniyor'}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Stats Card */}
          {user?.student && (
            <div className="card">
              <h3 className="mb-4">Akademik Durum</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Kayıtlı Bölüm</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                    {user.student.department?.name || 'Bilgisayar Programcılığı'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dönem Ort.</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.student.gpa || '0.00'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Genel Ort.</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{user.student.cgpa || '0.00'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="card">
            <h3 className="mb-4">Hızlı Erişim Menüsü</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleAction('courses')} style={{ justifyContent: 'start', height: '100%' }}>
                <BookIcon size={18} color="var(--accent-color)" />
                <span>Derslerim</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('grades')} style={{ justifyContent: 'start', height: '100%' }}>
                <GraduationCapIcon size={18} color="var(--accent-color)" />
                <span>Not Listesi</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('schedule')} style={{ justifyContent: 'start', height: '100%' }}>
                <CalendarIcon size={18} color="var(--text-secondary)" />
                <span>Ders Programı</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('settings')} style={{ justifyContent: 'start', height: '100%' }}>
                <SettingsIcon size={18} color="var(--text-secondary)" />
                <span>Hesap Ayarları</span>
              </button>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="card">
            <h3 className="mb-4">Duyurular & Haberler</h3>
            <div className="flex flex-col gap-3">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ minWidth: '60px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                  10 Ara
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Final Sınav Programı</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Akademik takvim güncellendi.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ minWidth: '60px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                  15 Ara
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Kütüphane Çalışma Saatleri</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vize haftası boyunca 7/24 açık.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '60px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                  05 Oca
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Bahar Dönemi Kayıtları</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ders seçimleri başlıyor.</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
