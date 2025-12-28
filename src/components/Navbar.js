import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { LogOutIcon, GraduationCapIcon, SunIcon, MoonIcon } from './Icons';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">
          <GraduationCapIcon size={28} color="var(--accent-color)" />
        </div>
        <h2>{t('navbar.title')}</h2>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle" 
              title={theme === 'light' ? t('navbar.darkMode') : t('navbar.lightMode')}
              aria-label={theme === 'light' ? t('navbar.darkMode') : t('navbar.lightMode')}
            >
              <div className="theme-toggle-inner">
                {theme === 'light' ? (
                  <MoonIcon size={18} className="theme-icon" />
                ) : (
                  <SunIcon size={18} className="theme-icon" />
                )}
              </div>
            </button>
            <button 
              onClick={toggleLanguage} 
              className="language-toggle" 
              title={language === 'tr' ? t('navbar.switchToEnglish') : t('navbar.switchToTurkish')}
            >
              {language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>
            <NotificationBell />
            <div className="user-info">
              <div className="user-avatar">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{formatName(user.full_name) || user.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-button" title={t('auth.logout')}>
              <LogOutIcon size={18} />
              <span>{t('auth.logout')}</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

