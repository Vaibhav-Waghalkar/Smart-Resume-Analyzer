import React, { createContext, useContext, useState, useEffect } from 'react';
import { resumeApi } from '../api/resumeApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sra_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sra_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      resumeApi.getMe()
        .then(data => {
          setUser(data);
          localStorage.setItem('sra_user', JSON.stringify(data));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await resumeApi.login(email, password);
      setUser(res.user);
      setToken(res.access_token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Invalid email or password'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const res = await resumeApi.register(email, password, name);
      setUser(res.user);
      setToken(res.access_token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    resumeApi.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
