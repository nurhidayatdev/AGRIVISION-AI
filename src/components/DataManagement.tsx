import {
  Bell,
  User,
  ChevronDown,
  Search,
  FileSpreadsheet,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function DataManagement({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
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
      <div className="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <span className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</span>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors">MANAJEMEN DATA</span>
          <span>/</span>
          <span className="text-gray-900">ALOKASI PUPUK</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight">Data Alokasi & Prediksi e-RDKK</h1>
          <button 
            onClick={() => onNavigate('import_data')}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2.5 rounded flex items-center gap-2 transition-colors text-[13px] tracking-wide shadow-sm"
          >
            <FileSpreadsheet size={16} strokeWidth={2} />
            Import Excel/BPS
          </button>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-5 flex gap-4 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pencarian</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                placeholder="Cari Kabupaten atau Region..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-[280px] space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode Bulan</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                <option>Semua Bulan</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="w-[280px] space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status Risiko</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                <option>Semua Status</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} strokeWidth={2} />
              </div>
            </div>
          </div>

          <button className="h-[38px] px-5 border border-gray-200 rounded bg-white text-gray-700 text-[13px] font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Filter size={14} strokeWidth={2} />
            Filter
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">Kode BPS</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kabupaten</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Luas Lahan (HA)</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Kuota Urea</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Prediksi Urea</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Kuota NPK</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Prediksi NPK</th>
                  <th className="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[140px]">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {/* Row 1 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">73.08</td>
                  <td className="py-4 px-6 font-bold text-gray-900">Kab. Bone</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">124,500.00</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">45,200</td>
                  <td className="py-4 px-6 text-right font-bold text-[#DC2626] font-mono flex items-center justify-end gap-1.5">
                    52,100 <TrendingUp size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">30,000</td>
                  <td className="py-4 px-6 text-right font-bold text-[#059669] font-mono flex items-center justify-end gap-1.5">
                    28,000 <TrendingDown size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-50 text-[#DC2626] border border-red-200 text-[10px] font-bold uppercase tracking-wider w-[68px]">KRITIS</span>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors bg-[#FAFAFA]">
                  <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">73.09</td>
                  <td className="py-4 px-6 font-bold text-gray-900">Kab. Maros</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">86,200.50</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">32,100</td>
                  <td className="py-4 px-6 text-right font-bold text-[#059669] font-mono flex items-center justify-end gap-1.5">
                    31,800 <TrendingDown size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">20,000</td>
                  <td className="py-4 px-6 text-right font-bold text-[#D97706] font-mono flex items-center justify-end gap-1.5">
                    22,000 <TrendingUp size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-bold uppercase tracking-wider w-[68px]">AMAN</span>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">73.06</td>
                  <td className="py-4 px-6 font-bold text-gray-900">Kab. Gowa</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">92,450.00</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">35,400</td>
                  <td className="py-4 px-6 text-right font-bold text-[#D97706] font-mono flex items-center justify-end gap-1.5">
                    38,200 <TrendingUp size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">25,000</td>
                  <td className="py-4 px-6 text-right font-bold text-[#D97706] font-mono flex items-center justify-end gap-1.5">
                    26,500 <TrendingUp size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-amber-50 text-[#D97706] border border-amber-200 text-[10px] font-bold uppercase tracking-wider w-[68px]">WASPADA</span>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors bg-[#FAFAFA]">
                  <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">73.14</td>
                  <td className="py-4 px-6 font-bold text-gray-900">Kab. Sidrap</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">110,800.00</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">41,500</td>
                  <td className="py-4 px-6 text-right font-bold text-[#059669] font-mono flex items-center justify-end gap-1.5">
                    41,200 <ArrowRight size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">35,000</td>
                  <td className="py-4 px-6 text-right font-bold text-[#059669] font-mono flex items-center justify-end gap-1.5">
                    34,500 <ArrowRight size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-bold uppercase tracking-wider w-[68px]">AMAN</span>
                  </td>
                </tr>
                {/* Row 5 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">73.15</td>
                  <td className="py-4 px-6 font-bold text-gray-900">Kab. Pinrang</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">95,600.25</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">38,900</td>
                  <td className="py-4 px-6 text-right font-bold text-[#DC2626] font-mono flex items-center justify-end gap-1.5">
                    44,500 <TrendingUp size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">28,000</td>
                  <td className="py-4 px-6 text-right font-bold text-[#DC2626] font-mono flex items-center justify-end gap-1.5">
                    31,000 <TrendingUp size={14} strokeWidth={2.5} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-50 text-[#DC2626] border border-red-200 text-[10px] font-bold uppercase tracking-wider w-[68px]">KRITIS</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500 bg-white rounded-b-md">
            <div>
              Menampilkan 1 hingga 5 dari 24 Kabupaten
            </div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">Seb</button>
              <button className="px-3 py-1.5 border border-[#10B981] bg-[#ECFDF5] text-[#059669] font-bold rounded">1</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">2</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">3</button>
              <span className="px-2">...</span>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">Lanjut</button>
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
