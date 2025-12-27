import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Redirect URL'yi query parametresi olarak ekle
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Yanlış role sahipse, login sayfasına yönlendir (başka hesap ile giriş yapması için)
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}&error=wrong_role`} replace />;
  }

  return children;
};

export default ProtectedRoute;

