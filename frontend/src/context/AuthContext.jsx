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
      const storedToken = localStorage.getItem('edushare_token');
      const storedUser = localStorage.getItem('edushare_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('edushare_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
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

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('edushare_user', JSON.stringify(merged));
      return merged;
    });
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
        updateUser,
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
