import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edushare_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      let storedToken = localStorage.getItem('edushare_token');
      let storedUser = localStorage.getItem('edushare_user');

      // Initialize student profile if not already set
      if (!storedToken || !storedUser) {
        const defaultStudent = {
          _id: 'usr-cs-101',
          name: 'Aryan Sharma',
          email: 'aryan.cs@edushare.ac.in',
          department: 'Computer Science',
          year: '2nd Year',
          semester: 4,
          role: 'student',
        };
        storedToken = 'auth-token-academic-edushare';
        storedUser = JSON.stringify(defaultStudent);
        localStorage.setItem('edushare_token', storedToken);
        localStorage.setItem('edushare_user', storedUser);
      }

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('edushare_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Session check failed:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: receivedToken, ...userData } = res.data.data;
      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('edushare_token', receivedToken);
      localStorage.setItem('edushare_user', JSON.stringify(userData));
      return { success: true, data: userData };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      const { token: receivedToken, ...registeredUser } = res.data.data;
      setToken(receivedToken);
      setUser(registeredUser);
      localStorage.setItem('edushare_token', receivedToken);
      localStorage.setItem('edushare_user', JSON.stringify(registeredUser));
      return { success: true, data: registeredUser };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edushare_token');
    localStorage.removeItem('edushare_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
