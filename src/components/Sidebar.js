import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard')}`}>
          <span className="sidebar-icon">🏠</span> Ana Sayfa
        </Link>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`}>
          <span className="sidebar-icon">👤</span> Profil
        </Link>
        <Link to="/my-courses" className={`sidebar-link ${isActive('/my-courses')}`}>
          <span className="sidebar-icon">📚</span> Derslerim
        </Link>
        <Link to="/grades" className={`sidebar-link ${isActive('/grades')}`}>
          <span className="sidebar-icon">🎓</span> Notlar
        </Link>

        {/* Yoklama Menüsü */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Yoklama</div>

          {/* Yoklama Başlat - Sadece Admin ve Faculty */}
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to="/attendance/start" className={`sidebar-link ${isActive('/attendance/start')}`}>
              <span className="sidebar-icon">📢</span> Yoklama Başlat
            </Link>
          )}

          {/* Yoklama Raporu - Sadece Admin ve Faculty */}
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to="/attendance/report/11111111-aaaa-bbbb-cccc-111111111111" className={`sidebar-link ${isActive('/attendance/report/11111111-aaaa-bbbb-cccc-111111111111')}`}>
              <span className="sidebar-icon">📊</span> Yoklama Raporu
            </Link>
          )}

          {/* Yoklama Geçmişim - Sadece Öğrenci */}
          {user?.role === 'student' && (
            <Link to="/my-attendance" className={`sidebar-link ${isActive('/my-attendance')}`}>
              <span className="sidebar-icon">📅</span> Yoklama Geçmişim
            </Link>
          )}
        </div>

        {/* Ders Seçme - Sadece Öğrenci */}
        {user?.role === 'student' && (
          <Link to="/enroll-courses" className={`sidebar-link ${isActive('/enroll-courses')}`}>
            <span className="sidebar-icon">✍️</span> Ders Seç
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/users" className={`sidebar-link ${isActive('/users')}`}>
            <span className="sidebar-icon">👥</span> Kullanıcılar
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

