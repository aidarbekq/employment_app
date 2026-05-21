/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

import api, { authStorage } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'ALUMNI' | 'EMPLOYER' | 'ADMIN';
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  password2: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ALUMNI' | 'EMPLOYER';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get<User>('users/me/');
      setUser(res.data);
      authStorage.setRole(res.data.role);
    } catch {
      setUser(null);
      authStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStorage.getAccessToken()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    authStorage.clear();
    const res = await api.post('users/login/', { username, password });
    authStorage.setTokens(res.data.access, res.data.refresh);
    await fetchUser();
  };

  const register = async (data: RegisterData) => {
    await api.post('users/register/', data);
    await login(data.username, data.password);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
