import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'undefined' && token !== 'null') {
      fetchCurrentUser();
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(user);
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Giriş başarısız';
      return {
        success: false,
        error: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const message = response.data.message || response.data.data?.message || 'Kayıt başarılı';
      return { success: true, message };
    } catch (error) {
      let errorMessage = 'Kayıt başarısız';
      // 409 Conflict için özel Türkçe mesaj
      if (error.response?.status === 409) {
        errorMessage = 'Bu e-posta adresiyle zaten bir hesap mevcut. Lütfen farklı bir e-posta kullanın veya giriş yapın.';
      } else {
        const errorData = error.response?.data?.error;
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (typeof errorData === 'object') {
            if (errorData.details && Array.isArray(errorData.details)) {
              errorMessage = errorData.details.join(', ');
            } else {
              errorMessage = errorData.message || JSON.stringify(errorData);
            }
          }
        }
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

