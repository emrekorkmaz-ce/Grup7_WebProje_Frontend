import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, GraduationCapIcon } from './Icons';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
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
        <h2>Kampüs Bilgi Sistemi</h2>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <div className="user-info">
              <div className="user-avatar">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{formatName(user.full_name) || user.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-button" title="Çıkış Yap">
              <LogOutIcon size={18} />
              <span>Çıkış</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

