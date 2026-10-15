import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken, getAccessToken } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const { success, error } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      // If unable to fetch me, token is likely expired or invalid
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchCurrentUser();
    } else {
      // Try refresh cookie automatically on first load
      api.refresh()
        .then((res) => {
          setAccessToken(res.accessToken);
          return api.getMe();
        })
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      setAccessToken(response.accessToken);
      setUser(response.user);
      success(`Welcome back, ${response.user.firstName}!`);
      setIsAuthModalOpen(false);
      return response;
    } catch (err) {
      error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (registerData) => {
    try {
      const response = await api.register(registerData);
      setAccessToken(response.accessToken);
      setUser(response.user);
      success(`Account created successfully! Welcome, ${response.user.firstName}!`);
      setIsAuthModalOpen(false);
      return response;
    } catch (err) {
      error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      setUser(null);
      success('You have been logged out safely.');
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        fetchCurrentUser,
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
