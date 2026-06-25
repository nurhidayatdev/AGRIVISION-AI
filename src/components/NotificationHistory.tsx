import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Search
} from 'lucide-react';

export default function NotificationHistory({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
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
            <button onClick={() => onNavigate('kelola_data')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Data</button>
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
        <div className="flex items-center text-[13px] font-medium text-gray-500 gap-2">
          <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => onNavigate('dashboard')}>Beranda</span>
          <span className="text-gray-400">›</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Notifikasi</span>
          <span className="text-gray-400">›</span>
          <span className="text-[#113224] font-bold">Riwayat Alert</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-x-hidden">
        
        {/* Header Section */}
        <div>
          <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight mb-1">Riwayat Peringatan Otomatis WhatsApp</h1>
          <p className="text-[13px] text-gray-500">Daftar alert defisit pupuk bersubsidi yang dikirim ke Dinas Kabupaten</p>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 p-6 flex flex-col justify-center">
            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Alert Terkirim</div>
            <div className="text-[42px] font-extrabold text-[#113224] leading-none tracking-tighter">24</div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white rounded-sm border-y border-r border-gray-200 border-l-4 border-l-[#B91C1C] shadow-sm flex-1 p-6 flex flex-col justify-center">
            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alert Belum Ditindaklanjuti</div>
            <div className="text-[42px] font-extrabold text-[#B91C1C] leading-none tracking-tighter">3</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 p-6 flex flex-col justify-center">
            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kabupaten Paling Sering Alert</div>
            <div className="text-[28px] font-extrabold text-[#113224] leading-tight tracking-tight">Kab. Bone</div>
          </div>
        </div>

        {/* Filters and Table Container */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 flex flex-col">
          
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Select Kabupaten */}
              <div className="relative w-[180px]">
                <select className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-[#F8FAFC] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                  <option>Semua Kabupaten</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2} />
                </div>
              </div>

              {/* Select Status */}
              <div className="relative w-[180px]">
                <select className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-[#F8FAFC] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                  <option>Semua Status</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2} />
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value="05/01/2024" 
                  readOnly
                  className="w-[120px] px-3 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 bg-[#F8FAFC] focus:outline-none"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input 
                  type="text" 
                  value="05/31/2024" 
                  readOnly
                  className="w-[120px] px-3 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 bg-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>

            {/* Search */}
            <div className="relative w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                placeholder="Cari pesan atau kabupaten..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400 bg-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[60px]">No</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[180px]">Tanggal & Waktu</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[140px]">Kabupaten</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[120px]">Jenis Pupuk</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[120px]">Defisit (%)</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider">Pesan WhatsApp</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[120px]">Status</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[140px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {/* Row 1 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 text-gray-500">1</td>
                  <td className="py-5 px-6 text-gray-600">12 Mei 2024, 08:30 WIB</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Kab. Bone</td>
                  <td className="py-5 px-6 text-gray-600">Urea</td>
                  <td className="py-5 px-6 font-bold text-[#B91C1C]">45.2%</td>
                  <td className="py-5 px-6 text-gray-500 truncate max-w-[200px]">Peringatan: Stok Urea di Kab. Bone menipis...</td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-red-100/50 text-[#B91C1C] text-[10px] font-bold uppercase tracking-wider border border-red-200">KRITIS</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button className="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors">Lihat Detail</button>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 text-gray-500">2</td>
                  <td className="py-5 px-6 text-gray-600">11 Mei 2024, 14:15 WIB</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Kab. Gowa</td>
                  <td className="py-5 px-6 text-gray-600">NPK</td>
                  <td className="py-5 px-6 font-bold text-[#D97706]">28.7%</td>
                  <td className="py-5 px-6 text-gray-500 truncate max-w-[200px]">Perhatian: Indikasi kekurangan pupuk NPK...</td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-amber-100/50 text-[#D97706] text-[10px] font-bold uppercase tracking-wider border border-amber-200">WASPADA</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button className="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors">Lihat Detail</button>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 text-gray-500">3</td>
                  <td className="py-5 px-6 text-gray-600">10 Mei 2024, 09:00 WIB</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Kab. Maros</td>
                  <td className="py-5 px-6 text-gray-600">Urea</td>
                  <td className="py-5 px-6 font-bold text-[#10B981]">5.1%</td>
                  <td className="py-5 px-6 text-gray-500 truncate max-w-[200px]">Update: Realokasi stok Urea untuk Kab. Maros...</td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-[#D1FAE5]/50 text-[#059669] text-[10px] font-bold uppercase tracking-wider border border-[#A7F3D0]">TERATASI</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button className="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors">Lihat Detail</button>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 text-gray-500">4</td>
                  <td className="py-5 px-6 text-gray-600">08 Mei 2024, 16:45 WIB</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Kab. Takalar</td>
                  <td className="py-5 px-6 text-gray-600">SP-36</td>
                  <td className="py-5 px-6 font-bold text-[#B91C1C]">38.9%</td>
                  <td className="py-5 px-6 text-gray-500 truncate max-w-[200px]">Peringatan: Stok SP-36 di Takalar di bawah...</td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-red-100/50 text-[#B91C1C] text-[10px] font-bold uppercase tracking-wider border border-red-200">KRITIS</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button className="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors">Lihat Detail</button>
                  </td>
                </tr>
                {/* Row 5 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 text-gray-500">5</td>
                  <td className="py-5 px-6 text-gray-600">07 Mei 2024, 11:20 WIB</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Kab. Pangkep</td>
                  <td className="py-5 px-6 text-gray-600">NPK</td>
                  <td className="py-5 px-6 font-bold text-[#D97706]">22.4%</td>
                  <td className="py-5 px-6 text-gray-500 truncate max-w-[200px]">Pemantauan: Tren penyerapan NPK Pangkep...</td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-amber-100/50 text-[#D97706] text-[10px] font-bold uppercase tracking-wider border border-amber-200">WASPADA</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button className="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors">Lihat Detail</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500">
            <div>
              Menampilkan <span className="font-bold text-gray-700">1</span> sampai <span className="font-bold text-gray-700">5</span> dari <span className="font-bold text-gray-700">24</span> data
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-sm text-gray-400 hover:bg-gray-50 transition-colors">Sebelumnya</button>
              <button className="px-4 py-2 border border-[#006B4D] bg-[#006B4D] text-white font-bold rounded-sm">1</button>
              <button className="px-4 py-2 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">2</button>
              <button className="px-4 py-2 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">3</button>
              <span className="px-2 text-gray-400">...</span>
              <button className="px-4 py-2 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">5</button>
              <button className="px-4 py-2 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">Selanjutnya</button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#E5E7EB] text-gray-600 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 font-bold mt-auto border-t border-gray-300">
        <div>© 2026 GovTech AgriVision AI. Restricted Government Access Only.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-900 transition-colors">Security Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact Admin</a>
        </div>
      </footer>
    </div>
  );
}
