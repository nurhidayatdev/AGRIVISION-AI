import {
  Bell,
  User,
  ChevronDown,
  Download,
  AlertTriangle,
  TrendingDown,
  Clock,
  Plus,
  Minus,
  Crosshair,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function Dashboard({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
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
            <button onClick={() => onNavigate('dashboard')} className="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Dashboard</button>
            <button onClick={() => onNavigate('kelola_data')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Data</button>
            <button onClick={() => onNavigate('cetak_laporan')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Cetak Laporan</button>
            <button onClick={() => onNavigate('users')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Pengguna</button>
          </div>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-6 h-full">
          <span className="text-[13px] text-white/90 font-medium">Senin, 22 Juni 2026</span>
          <button onClick={() => onNavigate('notifications')} className="relative text-white/90 hover:text-white mr-2">
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

      {/* Filter / Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 h-[60px] flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <span className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</span>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors">PUSAT KOMANDO ANALITIK</span>
          <span>/</span>
          <span className="text-gray-900">SULAWESI SELATAN</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center justify-between w-[160px] px-3 py-2 border border-gray-300 rounded text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <span>Filter Jenis: Urea</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} className="text-gray-500" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[300px] flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
          
          {/* Ringkasan Alokasi */}
          <div className="bg-white rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
            <h2 className="text-[13px] font-bold text-gray-500 tracking-wider uppercase mb-6">Ringkasan Alokasi</h2>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[40px] font-extrabold text-[#113224] tracking-tighter leading-none">124.000</span>
                <span className="text-lg font-bold text-[#113224]">Ha</span>
              </div>
              <div className="text-[11px] font-bold text-gray-500 tracking-wider mt-2">TOTAL LUAS LAHAN</div>
            </div>

            <div className="h-[1px] bg-gray-100 w-full mb-6"></div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[40px] font-extrabold text-[#006B4D] tracking-tighter leading-none">45.000</span>
                <span className="text-lg font-bold text-[#006B4D]">Ton</span>
              </div>
              <div className="text-[11px] font-bold text-gray-500 tracking-wider mt-2">TOTAL KUOTA UREA (TON)</div>
            </div>
          </div>

          {/* Wilayah Kritis */}
          <div className="bg-[#FCFDFD] rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <div className="px-5 py-3.5 border-b border-red-100 flex items-center justify-between bg-red-50/40 rounded-t-md">
              <div className="flex items-center gap-2.5 text-[#B91C1C]">
                <AlertTriangle size={18} strokeWidth={2.5} />
                <h2 className="text-[13px] font-extrabold tracking-widest uppercase">Wilayah Kritis</h2>
              </div>
              <span className="bg-red-200 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">LIVE</span>
            </div>

            <div className="p-5 flex flex-col gap-6">
              {/* Item 1 - Kritis */}
              <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-[15px] text-gray-900">Kab. Bone</h3>
                  <span className="bg-[#B91C1C] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none">KRITIS</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-3 pr-2">
                  Stok urea menipis, proyeksi habis dalam 3 hari. Defisit mencapai 15% dari e-RDKK.
                </p>
                <div className="flex items-center gap-1.5 text-[#B91C1C] text-[12px] font-bold">
                  <TrendingDown size={14} strokeWidth={2.5} />
                  <span>Defisit 15%</span>
                </div>
              </div>

              {/* Item 2 - Waspada */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-[15px] text-gray-900">Kab. Maros</h3>
                  <span className="bg-[#D97706] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none">WASPADA</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-3 pr-2">
                  Distribusi terhambat cuaca buruk. Keterlambatan pengiriman pupuk NPK.
                </p>
                <div className="flex items-center gap-1.5 text-[#D97706] text-[12px] font-bold">
                  <Clock size={14} strokeWidth={2.5} />
                  <span>Delay 48 Jam</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Main Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1E3B33] to-[#254A41] rounded-md px-8 py-7 flex items-center justify-between text-white shadow-sm shrink-0 relative overflow-hidden">
             {/* Decorative Background Pattern Overlay (Subtle) */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
             
            <div className="relative z-10">
              <h1 className="text-[22px] font-extrabold tracking-tight mb-2">Status Ketahanan Pupuk: Sulawesi Selatan</h1>
              <p className="text-white/80 text-[14px] font-medium">Analisis prediktif berbasis data cuaca dan realisasi e-RDKK bulan ini.</p>
            </div>
            <button className="relative z-10 bg-[#34D399] hover:bg-[#10B981] text-[#022C22] font-bold px-5 py-2.5 rounded flex items-center gap-2 transition-colors shadow-sm text-[13px] tracking-wide">
              <Sparkles size={16} className="text-[#022C22] fill-[#022C22]" />
              Jalankan Gemini AI
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-[#D1DFD9]/30 rounded-md border border-gray-200 relative overflow-hidden flex items-center justify-center min-h-[400px]">
             {/* Simulated Map Background (Lines/Grid) */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #94A3B8 10px, #94A3B8 11px)' }}></div>
            
            <span className="text-gray-400/80 font-bold text-xl tracking-widest uppercase relative z-0">Map Placeholder</span>

            {/* Floating Overlay Card */}
            <div className="absolute top-6 left-6 w-[300px] bg-white rounded-md shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col z-10 border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                <h3 className="font-extrabold text-[15px] text-[#113224] uppercase leading-snug w-3/4 tracking-tight">
                  Fokus Area: Kab. Bone
                </h3>
                <div className="bg-[#B91C1C] text-white text-[10px] font-bold px-2 py-1 rounded text-center leading-tight tracking-wider shrink-0">
                  STATUS:<br/>KRITIS
                </div>
              </div>

              <div className="p-5 flex flex-col">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Prediksi Kebutuhan AI
                </div>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-[28px] font-extrabold text-[#113224] tracking-tight leading-none">2.340</span>
                  <span className="text-[14px] font-bold text-gray-500">Ton</span>
                </div>

                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Trend 3 Bulan Terakhir
                </div>
                
                {/* Bar Chart Mockup */}
                <div className="flex items-end gap-2.5 h-[52px] mb-7">
                  <div className="flex-1 bg-gray-200 h-[35%] rounded-sm hover:bg-gray-300 transition-colors cursor-pointer relative group">
                     <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded">Bulan -2</div>
                  </div>
                  <div className="flex-1 bg-gray-200 h-[65%] rounded-sm hover:bg-gray-300 transition-colors cursor-pointer relative group">
                     <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded">Bulan -1</div>
                  </div>
                  <div className="flex-1 bg-[#B91C1C] h-[100%] rounded-sm hover:bg-red-800 transition-colors cursor-pointer shadow-[0_0_10px_rgba(185,28,28,0.3)] relative group">
                     <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-[#B91C1C] text-white text-[10px] font-bold py-1 px-2 rounded">Bulan Ini</div>
                  </div>
                </div>

                <button onClick={() => onNavigate('county_detail')} className="w-full py-2.5 border border-[#006B4D] text-[#006B4D] font-bold text-[13px] rounded hover:bg-[#006B4D] hover:text-white transition-colors tracking-wide">
                  LIHAT DETAIL WILAYAH
                </button>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
              <div className="bg-white rounded shadow-md flex flex-col overflow-hidden border border-gray-100">
                <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 border-b border-gray-100 transition-colors" title="Zoom In">
                  <Plus size={18} strokeWidth={2.5} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" title="Zoom Out">
                  <Minus size={18} strokeWidth={2.5} />
                </button>
              </div>
              <button className="w-9 h-9 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600 border border-gray-100 transition-colors" title="My Location">
                <Crosshair size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F5F7F5] text-gray-500 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 border-t border-gray-200 font-medium">
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
