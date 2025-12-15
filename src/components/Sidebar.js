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
          Ana Sayfa
        </Link>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`}>
          Profil
        </Link>
        <Link to="/my-courses" className={`sidebar-link ${isActive('/my-courses')}`}>
          Derslerim
        </Link>
        <Link to="/grades" className={`sidebar-link ${isActive('/grades')}`}>
          Notlar
        </Link>
        {/* Yoklama Menüsü - Her rol için göster */}
        <div className="sidebar-section">
          <div className="sidebar-section-title" style={{marginLeft: 20, marginTop: 20, color: '#fff', fontWeight: 600, fontSize: 15}}>Yoklama</div>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li>
              <Link to="/attendance/start" className={`sidebar-link ${isActive('/attendance/start')}`}>Yoklama Başlat</Link>
            </li>
            <li>
              <Link to="/attendance/report/1" className={`sidebar-link ${isActive('/attendance/report/1')}`}>Yoklama Raporu</Link>
            </li>
            <li>
              <Link to="/my-attendance" className={`sidebar-link ${isActive('/my-attendance')}`}>Yoklama Geçmişim</Link>
            </li>
          </ul>
        </div>
        {user?.role === 'admin' && (
          <Link to="/users" className={`sidebar-link ${isActive('/users')}`}>
            Kullanıcılar
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

