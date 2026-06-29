/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import ImportData from './components/ImportData';
import ReportGenerator from './components/ReportGenerator';
import CountyDetail from './components/CountyDetail';
import NotificationHistory from './components/NotificationHistory';
import UserManagement from './components/UserManagement';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentId, setCurrentId] = useState<number | null>(null);

  const handleNavigate = (page: string, id: number | null = null) => {
    setCurrentPage(page);
    setCurrentId(id);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (currentPage === 'kelola_data') {
    return <DataManagement onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} />;
  }
  
  if (currentPage === 'import_data') {
    return <ImportData onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'cetak_laporan') {
    return <ReportGenerator onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'county_detail') {
    return <CountyDetail onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} idKabupaten={currentId} />;
  }

  if (currentPage === 'notifications') {
    return <NotificationHistory onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'users') {
    return <UserManagement onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} />;
  }

  return <Dashboard onLogout={() => setIsLoggedIn(false)} onNavigate={handleNavigate} />;
}
