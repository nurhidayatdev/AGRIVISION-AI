import {
  Bell,
  User,
  LogOut,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Trash2,
  Sparkles,
  Lock
} from 'lucide-react';

export default function ImportData({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#023E2D] text-white flex items-center justify-between pl-6 pr-4 h-[64px] shrink-0">
        {/* Left: Logo & Nav */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <div className="flex items-center mr-10 gap-3">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z" fill="#006B4D" stroke="#0FE193" strokeWidth="1"/>
              <ellipse cx="12" cy="12" rx="2" ry="5.5" fill="#0FE193"/>
            </svg>
            <span className="font-extrabold text-[17px] tracking-wide">AGRIVISION AI</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center h-full text-[15px] font-medium ml-4">
            <button onClick={() => onNavigate('dashboard')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Dashboard</button>
            <button onClick={() => onNavigate('kelola_data')} className="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Kelola Data</button>
            <button onClick={() => onNavigate('cetak_laporan')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Cetak Laporan</button>
            <button onClick={() => onNavigate('users')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Pengguna</button>
          </div>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-6 h-full">
          <span className="text-[13px] text-white/90 font-medium">Senin, 22 Juni 2026</span>
          <button className="relative text-white/90 hover:text-white mr-2">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
          </button>
          
          <div className="flex items-center gap-3 border-l border-white/20 pl-6 py-2">
            <div className="text-right">
              <div className="text-[14px] font-bold leading-tight">Kadis Pertanian</div>
              <div className="text-[12px] text-white/70 font-medium">Admin Pusat</div>
            </div>
            <div 
              className="w-10 h-10 rounded-md bg-[#006B4D] flex items-center justify-center border border-white/10 hover:bg-[#00573E] cursor-pointer transition-colors group relative"
              onClick={onLogout}
              title="Logout"
            >
              <User size={18} className="text-white group-hover:hidden" strokeWidth={2.5} />
              <LogOut size={18} className="text-white hidden group-hover:block" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <span className="hover:text-gray-700 cursor-pointer transition-colors" onClick={() => onNavigate('dashboard')}>BERANDA</span>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors" onClick={() => onNavigate('kelola_data')}>MANAJEMEN DATA</span>
          <span>/</span>
          <span className="text-gray-900">IMPORT BERKAS INTEGRASI</span>
        </div>
        
        <button 
          onClick={() => onNavigate('kelola_data')}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Batal & Kembali
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-[700px] bg-white rounded-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-10">
          
          <h1 className="text-[24px] font-extrabold text-[#113224] tracking-tight mb-2">Unggah Dokumen e-RDKK & BPS</h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
            Sistem Gemini AI akan secara otomatis mengekstrak, memvalidasi, dan merekonsiliasi data alokasi pupuk bersubsidi dengan basis data spasial BPS.
          </p>

          <div className="h-[1px] w-full bg-gray-100 mb-8"></div>

          {/* Drag & Drop Zone */}
          <div className="border-2 border-dashed border-gray-300 rounded-md bg-[#F8FAFC] py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors mb-6 group">
            <div className="w-16 h-16 bg-[#D1DFD9] rounded flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <FileText size={32} className="text-[#023E2D]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[17px] font-extrabold text-[#113224] mb-2 tracking-wide">Tarik & Lepas File di Sini</h3>
            <p className="text-[14px] text-gray-500 mb-5">atau klik untuk menelusuri dari perangkat</p>
            <div className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1.5 rounded tracking-widest uppercase">
              MENDUKUNG: .XLSX, .CSV (MAX 50MB)
            </div>
          </div>

          {/* Uploaded File State */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-md p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="text-[#10B981]">
                <CheckCircle2 size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#113224]">data_alokasi_sulsel_2026.xlsx</div>
                <div className="text-[13px] text-gray-500 mt-0.5">2.4 MB • Selesai diunggah</div>
              </div>
            </div>
            <button className="text-[#DC2626] hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50">
              <Trash2 size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Submit Button */}
          <button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-4 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] tracking-wider mb-8 shadow-sm">
            <Sparkles size={18} strokeWidth={2} />
            MULAI EKSTRAKSI AI
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock size={14} strokeWidth={2} />
            <span className="text-[12px] font-medium">Protokol Enkripsi End-to-End GovTech Klasifikasi Terbatas</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F5F7F5] text-gray-500 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 border-t border-gray-200 font-medium mt-auto">
        <div>© 2026 GovTech AgriVision AI. Restricted Government Access Only.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-800 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-800 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-800 transition-colors">Security Protocol</a>
          <a href="#" className="hover:text-gray-800 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
