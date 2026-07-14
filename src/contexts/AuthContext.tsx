import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  login: (userData: UserSession) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Periksa sesi saat aplikasi pertama kali dimuat
    const sessionStr = localStorage.getItem('agrivision_session');
    if (sessionStr) {
      try {
        const userData: UserSession = JSON.parse(sessionStr);
        setUser(userData);
      } catch (e) {
        console.error("Sesi tidak valid", e);
        localStorage.removeItem('agrivision_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem('agrivision_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrivision_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
