import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">Memuat otentikasi...</div>;
  }

  if (!user) {
    // Belum login, arahkan ke halaman utama
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role tidak sesuai, kembalikan ke dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
