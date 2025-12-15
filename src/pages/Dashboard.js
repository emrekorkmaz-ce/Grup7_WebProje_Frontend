import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

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
      // Eğer bir ders programı sayfanız varsa route'u ekleyin, yoksa alert bırakabilirsiniz
      alert('Ders Programı sayfası yapım aşamasında.');
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
        <header className="mb-8 p-6 card" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)',
          borderLeft: '4px solid var(--accent-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Hoş geldin, {formatName(user?.full_name)} 👋</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{currentDate}</p>
          </div>
          <div className="hidden md:block">
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {getInitials(user?.full_name || user?.email)}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

          {/* Profile Summary Card */}
          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-gray-400 uppercase tracking-wider">Profil Özeti</h3>
            <div className="flex flex-col gap-3">
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>E-posta</span>
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Telefon</span>
                <span style={{ fontWeight: 500 }}>{user?.phone || '-'}</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', background: user?.is_verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: user?.is_verified ? 'var(--success)' : 'var(--warning)' }}>
                  {user?.is_verified ? '✅ Doğrulanmış Hesap' : '⏳ Doğrulama Bekliyor'}
                </span>
              </div>
            </div>
          </div>

          {/* Academic/Faculty Info Card */}
          {user?.student && (
            <div className="card">
              <h3 className="mb-4 text-base font-semibold text-gray-400 uppercase tracking-wider">Akademik Durum</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bölüm</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.student.department?.name || 'Bilgisayar Programcılığı'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GNO</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{user.student.gpa || '0.00'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AGNO</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{user.student.cgpa || '0.00'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-gray-400 uppercase tracking-wider">Hızlı Erişim</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleAction('courses')} style={{ justifyContent: 'start', gap: '0.5rem' }}>
                📚 Derslerim
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('grades')} style={{ justifyContent: 'start', gap: '0.5rem' }}>
                🎓 Notlarım
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('schedule')} style={{ justifyContent: 'start', gap: '0.5rem' }}>
                📅 Program
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('settings')} style={{ justifyContent: 'start', gap: '0.5rem' }}>
                ⚙️ Ayarlar
              </button>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-gray-400 uppercase tracking-wider">Duyurular</h3>
            <div className="flex flex-col gap-3">
              <div style={{ borderLeft: '3px solid var(--warning)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>10 Ara</div>
                <div>Final Sınav Programı Açıklandı</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--accent-color)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>15 Ara</div>
                <div>Kütüphane Çalışma Saatleri</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>05 Oca</div>
                <div>Bahar Dönemi Kayıtları</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;

