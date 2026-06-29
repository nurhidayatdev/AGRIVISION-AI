import { Bell, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../assets/logo_agrivision_ai.png';

interface NavbarProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  activePage: 'dashboard' | 'kelola_data' | 'cetak_laporan' | 'users' | string;
}

export default function Navbar({ onNavigate, onLogout, activePage }: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem('agrivision_session');
    if (sessionStr) {
      try {
        setCurrentUser(JSON.parse(sessionStr));
      } catch (e) {}
    }
  }, []);

  const getBtnClass = (page: string) => {
    return activePage === page
      ? "px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide"
      : "px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90";
  };

  return (
    <nav className="bg-[#023E2D] text-white flex items-center justify-between pl-6 pr-4 h-[64px] shrink-0">
      <div className="flex items-center h-full">
        <div className="flex items-center mr-10 gap-3">
          <img src={logo} alt="AgriVision AI Logo" className="w-7 h-7 object-contain" />
          <span className="font-extrabold text-[17px] tracking-wide">AGRIVISION AI</span>
        </div>
        <div className="flex items-center h-full text-[15px] font-medium ml-4">
          <button onClick={() => onNavigate('dashboard')} className={getBtnClass('dashboard')}>Dashboard</button>
          <button onClick={() => onNavigate('kelola_data')} className={getBtnClass('kelola_data')}>Kelola Data</button>
          <button onClick={() => onNavigate('cetak_laporan')} className={getBtnClass('cetak_laporan')}>Cetak Laporan</button>
          <button onClick={() => onNavigate('users')} className={getBtnClass('users')}>Kelola Pengguna</button>
        </div>
      </div>

      <div className="flex items-center gap-6 h-full">
        <span className="text-[13px] text-white/90 font-medium">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => onNavigate('notifications')} className="relative text-white/90 hover:text-white mr-2 cursor-pointer transition-colors">
          <Bell size={18} strokeWidth={2.5} />
          <span className="absolute --top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-white/20 pl-6 py-2">
          <div className="text-right">
            <div className="text-[14px] font-bold leading-tight">{currentUser?.nama_lengkap || 'Admin'}</div>
            <div className="text-[12px] text-white/70 font-medium">{currentUser?.role || 'Sistem'}</div>
          </div>
          <div 
            className="w-10 h-10 rounded-md bg-[#006B4D] flex items-center justify-center border border-white/10 hover:bg-[#00573E] cursor-pointer transition-colors group relative"
            onClick={onLogout}
          >
            <User size={18} className="text-white group-hover:hidden" strokeWidth={2.5} />
            <LogOut size={18} className="text-white hidden group-hover:block" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </nav>
  );
}
