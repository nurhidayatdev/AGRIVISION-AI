import { Bell, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo_agrivision_ai.png';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page from location.pathname, strip leading slash
  const activePage = location.pathname.substring(1) || 'dashboard';

  const handleNavigate = (page: string) => {
    setMenuOpen(false);
    navigate('/' + page);
  };

  const getBtnClass = (page: string) => {
    return activePage === page
      ? "px-4 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide text-[14px]"
      : "px-4 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90 text-[14px]";
  };

  const getMobileBtnClass = (page: string) => {
    return activePage === page
      ? "w-full px-4 py-3 flex items-center bg-[#006B4D] text-white font-bold text-[14px]"
      : "w-full px-4 py-3 flex items-center hover:bg-[#004D36] transition-colors text-white/90 text-[14px]";
  };

  return (
    <nav className="bg-[#023E2D] text-white shrink-0 z-50 relative">
      {/* Desktop Navbar */}
      <div className="flex items-center justify-between pl-4 pr-4 h-[64px]">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center h-full">
          <div className="flex items-center mr-6 gap-3">
            <img src={logo} alt="AgriVision AI Logo" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-[15px] md:text-[17px] tracking-wide">AGRIVISION AI</span>
          </div>
          {/* Desktop menu - hidden on mobile */}
          <div className="hidden lg:flex items-center h-full text-[14px] font-medium">
            {user?.role !== 'PPL' && (
              <button onClick={() => handleNavigate('dashboard')} className={getBtnClass('dashboard')}>Dashboard</button>
            )}
            
            {user?.role === 'PPL' && (
              <button onClick={() => handleNavigate('laporan_ppl')} className={getBtnClass('laporan_ppl')}>Laporan Lapangan</button>
            )}

            {(user?.role === 'Admin Provinsi' || user?.role === 'Admin Pusat' || user?.role === 'Super Admin Provinsi' || user?.role === 'Admin Kabupaten') && (
              <button onClick={() => handleNavigate('kelola_data')} className={getBtnClass('kelola_data')}>Kelola Data</button>
            )}

            {(user?.role === 'Admin Provinsi' || user?.role === 'Admin Pusat' || user?.role === 'Super Admin Provinsi') && (
              <>
                <button onClick={() => handleNavigate('cetak_laporan')} className={getBtnClass('cetak_laporan')}>Cetak Laporan</button>
                <button onClick={() => handleNavigate('users')} className={getBtnClass('users')}>Kelola Pengguna</button>
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 h-full">
          {/* Date - hidden on small screens */}
          <span className="hidden xl:block text-[12px] text-white/90 font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>

          <button onClick={() => handleNavigate('notifikasi')} className="relative text-white/90 hover:text-white cursor-pointer transition-colors">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
          </button>

          {/* User info - hidden on small screens */}
          <div className="hidden md:flex items-center gap-3 border-l border-white/20 pl-4 py-2">
            <div className="text-right">
              <div className="text-[13px] font-bold leading-tight">{user?.nama_lengkap || 'Admin'}</div>
              <div className="text-[11px] text-white/70 font-medium">{user?.role || 'Sistem'}</div>
            </div>
            <div
              className="w-9 h-9 rounded-md bg-[#006B4D] flex items-center justify-center border border-white/10 hover:bg-[#00573E] cursor-pointer transition-colors group relative"
              onClick={logout}
            >
              <User size={16} className="text-white group-hover:hidden" strokeWidth={2.5} />
              <LogOut size={16} className="text-white hidden group-hover:block" strokeWidth={2.5} />
            </div>
          </div>

          {/* Hamburger - shown on mobile/tablet */}
          <button
            className="lg:hidden ml-2 p-2 rounded hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#023E2D] border-t border-white/10 flex flex-col shadow-xl">
          {user?.role !== 'PPL' && (
            <button onClick={() => handleNavigate('dashboard')} className={getMobileBtnClass('dashboard')}>Dashboard</button>
          )}
          
          {user?.role === 'PPL' && (
            <button onClick={() => handleNavigate('laporan_ppl')} className={getMobileBtnClass('laporan_ppl')}>Laporan Lapangan</button>
          )}

          {(user?.role === 'Admin Provinsi' || user?.role === 'Admin Pusat' || user?.role === 'Super Admin Provinsi' || user?.role === 'Admin Kabupaten') && (
            <button onClick={() => handleNavigate('kelola_data')} className={getMobileBtnClass('kelola_data')}>Kelola Data</button>
          )}

          {(user?.role === 'Admin Provinsi' || user?.role === 'Admin Pusat' || user?.role === 'Super Admin Provinsi') && (
            <>
              <button onClick={() => handleNavigate('cetak_laporan')} className={getMobileBtnClass('cetak_laporan')}>Cetak Laporan</button>
              <button onClick={() => handleNavigate('users')} className={getMobileBtnClass('users')}>Kelola Pengguna</button>
            </>
          )}

          {/* Mobile user info + logout */}
          <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-bold">{user?.nama_lengkap || 'Admin'}</div>
              <div className="text-[11px] text-white/70">{user?.role || 'Sistem'}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-[#006B4D] hover:bg-[#00573E] transition-colors px-3 py-2 rounded text-[13px] font-bold"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
