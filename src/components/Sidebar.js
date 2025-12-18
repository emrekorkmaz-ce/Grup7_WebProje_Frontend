import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserIcon,
  BookIcon,
  GraduationCapIcon,
  MegaphoneIcon,
  ChartIcon,
  CalendarIcon,
  EditIcon,
  UsersIcon
} from './Icons';
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
          <HomeIcon size={20} className="sidebar-icon" />
          <span>Ana Sayfa</span>
        </Link>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`}>
          <UserIcon size={20} className="sidebar-icon" />
          <span>Profil</span>
        </Link>
        <Link to="/my-courses" className={`sidebar-link ${isActive('/my-courses')}`}>
          <BookIcon size={20} className="sidebar-icon" />
          <span>Derslerim</span>
        </Link>
        <Link to="/grades" className={`sidebar-link ${isActive('/grades')}`}>
          <GraduationCapIcon size={20} className="sidebar-icon" />
          <span>Notlar</span>
        </Link>

        {/* Yoklama Menüsü */}
        <div className="sidebar-section">
          {/* <div className="sidebar-section-title">YOKLAMA İŞLEMLERİ</div> */}

          {/* Yoklama Başlat - Sadece Admin ve Faculty */}
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to="/attendance/start" className={`sidebar-link ${isActive('/attendance/start')}`}>
              <MegaphoneIcon size={20} className="sidebar-icon" />
              <span>Yoklama Başlat</span>
            </Link>
          )}

          {/* Yoklama Raporu - Sadece Admin ve Faculty */}
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to="/attendance/report/11111111-aaaa-bbbb-cccc-111111111111" className={`sidebar-link ${isActive('/attendance/report/11111111-aaaa-bbbb-cccc-111111111111')}`}>
              <ChartIcon size={20} className="sidebar-icon" />
              <span>Yoklama Raporu</span>
            </Link>
          )}

          {/* Yoklama Geçmişim - Sadece Öğrenci */}
          {user?.role === 'student' && (
            <Link to="/my-attendance" className={`sidebar-link ${isActive('/my-attendance')}`}>
              <CalendarIcon size={20} className="sidebar-icon" />
              <span>Devamsızlık Durumu</span>
            </Link>
          )}
        </div>

        {/* Ders Seçme - Sadece Öğrenci */}
        {user?.role === 'student' && (
          <Link to="/enroll-courses" className={`sidebar-link ${isActive('/enroll-courses')}`}>
            <EditIcon size={20} className="sidebar-icon" />
            <span>Ders Seçimi</span>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/users" className={`sidebar-link ${isActive('/users')}`}>
            <UsersIcon size={20} className="sidebar-icon" />
            <span>Kullanıcı Yönetimi</span>
          </Link>
        )}

        {/* Part 3: Meal Service */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">YEMEK SERVİSİ</div>
          <Link to="/meals/menu" className={`sidebar-link ${isActive('/meals/menu')}`}>
            <span className="sidebar-icon">🍽️</span>
            <span>Yemek Menüsü</span>
          </Link>
          <Link to="/meals/reservations" className={`sidebar-link ${isActive('/meals/reservations')}`}>
            <span className="sidebar-icon">📋</span>
            <span>Rezervasyonlarım</span>
          </Link>
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to="/meals/scan" className={`sidebar-link ${isActive('/meals/scan')}`}>
              <span className="sidebar-icon">📷</span>
              <span>QR Kod Tarayıcı</span>
            </Link>
          )}
        </div>

        {/* Part 3: Wallet */}
        <Link to="/wallet" className={`sidebar-link ${isActive('/wallet')}`}>
          <span className="sidebar-icon">💳</span>
          <span>Cüzdan</span>
        </Link>

        {/* Part 3: Events */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">ETKİNLİKLER</div>
          <Link to="/events" className={`sidebar-link ${isActive('/events')}`}>
            <span className="sidebar-icon">🎉</span>
            <span>Etkinlikler</span>
          </Link>
          <Link to="/my-events" className={`sidebar-link ${isActive('/my-events')}`}>
            <span className="sidebar-icon">📅</span>
            <span>Etkinliklerim</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/events/checkin" className={`sidebar-link ${isActive('/events/checkin')}`}>
              <span className="sidebar-icon">✓</span>
              <span>Check-in</span>
            </Link>
          )}
        </div>

        {/* Part 3: Schedule */}
        <Link to="/schedule" className={`sidebar-link ${isActive('/schedule')}`}>
          <CalendarIcon size={20} className="sidebar-icon" />
          <span>Ders Programı</span>
        </Link>

        {/* Part 3: Classroom Reservations */}
        <Link to="/reservations" className={`sidebar-link ${isActive('/reservations')}`}>
          <span className="sidebar-icon">🏫</span>
          <span>Derslik Rezervasyonu</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;

