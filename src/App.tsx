/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load komponen halaman
const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const ImportData = lazy(() => import('./components/ImportData'));
const ReportGenerator = lazy(() => import('./components/ReportGenerator'));
const CountyDetail = lazy(() => import('./components/CountyDetail'));
const NotificationHistory = lazy(() => import('./components/NotificationHistory'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const PplReport = lazy(() => import('./components/PplReport'));

// Komponen penampung sementara saat file JS sedang diunduh
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006B4D]"></div>
      <p className="mt-4 text-gray-600 font-medium text-sm">Menyiapkan halaman...</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/kelola_data" element={<ProtectedRoute allowedRoles={['Admin Provinsi', 'Admin Kabupaten']}><DataManagement /></ProtectedRoute>} />
        <Route path="/import_data" element={<ProtectedRoute allowedRoles={['Admin Provinsi', 'Admin Kabupaten']}><ImportData /></ProtectedRoute>} />
        <Route path="/cetak_laporan" element={<ProtectedRoute><ReportGenerator /></ProtectedRoute>} />
        <Route path="/notifikasi" element={<ProtectedRoute><NotificationHistory /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin Provinsi', 'Admin Kabupaten']}><UserManagement /></ProtectedRoute>} />
        <Route path="/kabupaten/:id" element={<ProtectedRoute allowedRoles={['Admin Provinsi', 'Admin Kabupaten']}><CountyDetail /></ProtectedRoute>} />
        <Route path="/laporan_ppl" element={<ProtectedRoute allowedRoles={['PPL']}><PplReport /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
