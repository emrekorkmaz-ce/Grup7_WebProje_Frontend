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
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data.data || response.data);
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
      const data = response.data.data || response.data;
      const { user, accessToken, refreshToken } = data;
      
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(user);
      return { success: true, user };
    } catch (error) {
      let errorMessage = 'Giriş başarısız';
      
      if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.error.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response.data.error.details && Array.isArray(error.response.data.error.details)) {
          errorMessage = error.response.data.error.details.join(', ');
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        errorMessage = error.response.data.details.join(', ');
      }
      
      return {
        success: false,
        error: errorMessage
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
      
      if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response.data.error.message) {
          errorMessage = error.response.data.error.message;
          if (error.response.data.error.details && Array.isArray(error.response.data.error.details) && error.response.data.error.details.length > 0) {
            errorMessage += ': ' + error.response.data.error.details.join(', ');
          }
        } else if (error.response.data.error.details && Array.isArray(error.response.data.error.details)) {
          errorMessage = error.response.data.error.details.join(', ');
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
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

