import { useState } from 'react';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye
} from 'lucide-react';

export default function UserManagement({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans relative">
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
            <button className="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Kelola Pengguna</button>
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

      {/* Breadcrumb Bar */}
      <div className="bg-white px-6 py-4 shrink-0 border-b border-gray-200">
        <div className="flex items-center text-[13px] font-medium text-gray-500 gap-2 mb-2">
          <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => onNavigate('dashboard')}>Beranda</span>
          <span className="text-gray-400">›</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Pengaturan</span>
          <span className="text-gray-400">›</span>
          <span className="text-[#113224] font-bold">Kelola Pengguna</span>
        </div>
        <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight">Daftar Akun Pengguna Sistem</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Filter and Action Bar */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                placeholder="Cari nama atau NIP..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Role Filter */}
            <div className="relative w-[180px]">
              <select className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                <option>Semua Role</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} strokeWidth={2} />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#022C22] hover:bg-[#042f2e] text-white font-bold px-4 py-2.5 rounded-sm flex items-center gap-2 transition-colors text-[13px] shadow-sm tracking-wide"
          >
            <Plus size={16} strokeWidth={2.5} />
            Tambah Pengguna Baru
          </button>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[60px]">No</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[160px]">NIP</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[140px]">Role</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[200px]">Kabupaten/Instansi</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[140px]">Terakhir Login</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[120px]">Status Akun</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-700">
                {/* Row 1 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6">1</td>
                  <td className="py-5 px-6 font-mono font-bold tracking-tight text-gray-600">19850101 201012 1 001</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Dr. Ir. Andi Sudirman</td>
                  <td className="py-5 px-6">
                    <span className="bg-[#1e3a33] text-white px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#1e3a33]">Admin Pusat</span>
                  </td>
                  <td className="py-5 px-6">Dinas Pertanian Prov. Sulsel</td>
                  <td className="py-5 px-6 text-gray-500">2 jam yang lalu</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Aktif
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-[#006B4D] hover:text-[#004D36] transition-colors"><Pencil size={16} strokeWidth={2} /></button>
                      <button className="text-[#DC2626] hover:text-red-800 transition-colors"><Trash2 size={16} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors bg-gray-50/30">
                  <td className="py-5 px-6">2</td>
                  <td className="py-5 px-6 font-mono font-bold tracking-tight text-gray-600">19780512 200501 2 003</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Hj. Siti Fatimah</td>
                  <td className="py-5 px-6">
                    <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-sm text-[11px] font-medium border border-gray-300">Kadis Provinsi</span>
                  </td>
                  <td className="py-5 px-6">Kab. Bone</td>
                  <td className="py-5 px-6 text-gray-500">1 hari yang lalu</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Aktif
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-[#006B4D] hover:text-[#004D36] transition-colors"><Pencil size={16} strokeWidth={2} /></button>
                      <button className="text-[#DC2626] hover:text-red-800 transition-colors"><Trash2 size={16} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6">3</td>
                  <td className="py-5 px-6 font-mono font-bold tracking-tight text-gray-600">19920315 201504 1 005</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Budi Prasetyo</td>
                  <td className="py-5 px-6">
                    <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-sm text-[11px] font-medium border border-gray-300">Staf Kabupaten</span>
                  </td>
                  <td className="py-5 px-6">Kab. Gowa</td>
                  <td className="py-5 px-6 text-gray-500">5 menit yang lalu</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Aktif
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-[#006B4D] hover:text-[#004D36] transition-colors"><Pencil size={16} strokeWidth={2} /></button>
                      <button className="text-[#DC2626] hover:text-red-800 transition-colors"><Trash2 size={16} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors bg-gray-50/30">
                  <td className="py-5 px-6">4</td>
                  <td className="py-5 px-6 font-mono font-bold tracking-tight text-gray-600">19891120 201402 2 008</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Rini Handayani</td>
                  <td className="py-5 px-6">
                    <span className="bg-[#D1FAE5] text-[#059669] px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#A7F3D0]">PPL</span>
                  </td>
                  <td className="py-5 px-6">Kec. Tanete Riattang</td>
                  <td className="py-5 px-6 text-gray-500">3 hari yang lalu</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> Nonaktif
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-[#006B4D] hover:text-[#004D36] transition-colors"><Pencil size={16} strokeWidth={2} /></button>
                      <button className="text-[#DC2626] hover:text-red-800 transition-colors"><Trash2 size={16} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
                {/* Row 5 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6">5</td>
                  <td className="py-5 px-6 font-mono font-bold tracking-tight text-gray-600">19820707 200810 1 012</td>
                  <td className="py-5 px-6 font-bold text-gray-900">Ahmad Fauzi</td>
                  <td className="py-5 px-6">
                    <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-sm text-[11px] font-medium border border-gray-300">Staf Kabupaten</span>
                  </td>
                  <td className="py-5 px-6">Kab. Maros</td>
                  <td className="py-5 px-6 text-gray-500">1 minggu yang lalu</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Aktif
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-[#006B4D] hover:text-[#004D36] transition-colors"><Pencil size={16} strokeWidth={2} /></button>
                      <button className="text-[#DC2626] hover:text-red-800 transition-colors"><Trash2 size={16} strokeWidth={2} /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500 bg-white rounded-b-md">
            <div>
              Menampilkan 1 hingga 5 dari 42 data
            </div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50 transition-colors">Sebelumnya</button>
              <button className="px-3 py-1.5 border border-[#022C22] bg-[#022C22] text-white font-bold rounded-sm">1</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">2</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">3</button>
              <span className="px-2">...</span>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">5</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">Selanjutnya</button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#E5E7EB] text-gray-600 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 font-bold mt-auto border-t border-gray-300">
        <div>© 2026 GovTech AgriVision AI. Restricted Government Access Only.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Security Protocol</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a>
        </div>
      </footer>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
          {/* Modal Container */}
          <div className="bg-white rounded-md shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#113224] tracking-tight">Tambah Pengguna Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">
              
              {/* NIP */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">NIP</label>
                <input 
                  type="text" 
                  placeholder="Masukkan Nomor Induk Pegawai" 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">Nama Lengkap</label>
                <input 
                  type="text" 
                  placeholder="Beserta gelar akademik" 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">Role</label>
                <div className="relative">
                  <select className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                    <option>Pilih Role Sistem</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* Kabupaten/Instansi */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">Kabupaten/Instansi</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ketik untuk mencari instansi..." 
                    className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={14} strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* Password Row */}
              <div className="flex gap-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[13px] font-bold text-[#113224]">Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Min. 8 karakter" 
                      className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                      <Eye size={14} strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-[13px] font-bold text-[#113224]">Konfirmasi Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Ulangi password" 
                      className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                      <Eye size={14} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold text-[13px] rounded-sm hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-[#022C22] hover:bg-[#042f2e] text-white font-bold text-[13px] rounded-sm transition-colors shadow-sm"
              >
                Simpan Akun
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
