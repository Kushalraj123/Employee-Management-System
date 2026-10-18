import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

const STORAGE_KEY_TOKEN = 'nexus_auth_token';
const STORAGE_KEY_USER = 'nexus_auth_user';

export const AuthProvider = ({ children }) => {
  // Clear any legacy persisted session so the site always starts at the login page
  useState(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  });
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY_TOKEN) || null);
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Sync token to axios client
  useEffect(() => {
    if (token) {
      api.setAuthToken(token);
    } else {
      api.setAuthToken(null);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      const authToken = res.token;
      const userData = res.user;

      setToken(authToken);
      setUser(userData);
      sessionStorage.setItem(STORAGE_KEY_TOKEN, authToken);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role = 'admin') => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role);
      const authToken = res.token;
      const userData = res.user;

      setToken(authToken);
      setUser(userData);
      sessionStorage.setItem(STORAGE_KEY_TOKEN, authToken);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    api.setAuthToken(null);
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
  };

  const role = user?.role || 'employee';
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'admin';
  const isHR = role === 'hr';
  const isEmployee = role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        loading,
        isAuthenticated,
        isAdmin,
        isHR,
        isEmployee,
        login,
        demoLogin,
        logout,
        updateProfile,
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

export default AuthContext;
