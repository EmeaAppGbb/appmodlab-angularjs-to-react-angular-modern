import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '../utils/api';
import type { User, AuthTokens, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
        email,
        password,
      });
      const { user: loggedInUser, tokens } = response.data;
      localStorage.setItem('authToken', tokens.accessToken);
      localStorage.setItem('authUser', JSON.stringify(loggedInUser));
      setToken(tokens.accessToken);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = user !== null && token !== null;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
