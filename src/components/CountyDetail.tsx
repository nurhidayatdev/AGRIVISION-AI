import {
  Bell,
  User,
  LogOut,
  ArrowLeft,
  Download,
  Printer,
  Package,
  LineChart,
  AlertTriangle,
  Plus,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

export default function CountyDetail({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
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
        <div className="flex items-center text-[13px] font-medium text-gray-500 gap-2">
          <button onClick={() => onNavigate('dashboard')} className="mr-2 text-gray-700 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => onNavigate('dashboard')}>Beranda</span>
          <span className="text-gray-400">›</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => onNavigate('dashboard')}>Dashboard</span>
          <span className="text-gray-400">›</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Detail Wilayah</span>
          <span className="text-gray-400">›</span>
          <span className="text-[#113224] font-bold">Kab. Bone</span>
        </div>
        <div className="flex items-center gap-5 text-[12px] font-bold text-gray-600">
          <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <Download size={14} strokeWidth={2.5} /> Unduh
          </button>
          <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <Printer size={14} strokeWidth={2.5} /> Cetak
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Left Column */}
        <div className="w-[320px] flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
            <div className="flex justify-between items-start mb-1">
              <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight">Kabupaten Bone</h1>
              <span className="bg-[#B91C1C] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none mt-1.5">KRITIS</span>
            </div>
            <p className="text-[13px] text-gray-500 mb-6">BPS Code: 73.08</p>
            
            <div className="h-[1px] bg-gray-100 w-full mb-5"></div>
            
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Luas Tanam</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-extrabold text-[#113224] tracking-tight">124,500.00</span>
              <span className="text-[14px] font-bold text-[#113224]">Ha</span>
            </div>
          </div>

          {/* Quota vs Prediction Card */}
          <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
             <div className="flex items-center gap-2 mb-2 text-[#006B4D]">
               <Package size={14} strokeWidth={2.5} />
               <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Kuota Urea Saat Ini</span>
             </div>
             <div className="flex items-baseline gap-1.5 mb-6">
               <span className="text-[32px] font-extrabold text-[#113224] leading-none tracking-tighter">25,000</span>
               <span className="text-[12px] font-bold text-gray-500">Ton</span>
             </div>

             <div className="flex items-center gap-2 mb-2 text-[#006B4D]">
               <LineChart size={14} strokeWidth={2.5} />
               <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Prediksi Kebutuhan AI</span>
             </div>
             <div className="flex items-baseline gap-1.5 mb-6">
               <span className="text-[32px] font-extrabold text-[#113224] leading-none tracking-tighter">28,340</span>
               <span className="text-[12px] font-bold text-gray-500">Ton</span>
             </div>

             <div className="bg-red-50 border border-red-100 rounded p-4 flex flex-col gap-1.5 items-start">
               <div className="flex items-center gap-1.5 text-[#DC2626]">
                 <AlertTriangle size={14} strokeWidth={2.5}/>
                 <span className="text-[11px] font-bold uppercase tracking-wider">Status Pasokan</span>
               </div>
               <span className="text-[16px] font-extrabold text-[#DC2626] tracking-tight">Defisit 3,340 Ton (11.8%)</span>
             </div>
          </div>

          {/* Action Button */}
          <button className="w-full bg-[#006B4D] hover:bg-[#00573E] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] shadow-sm tracking-wide">
            <Plus size={18} strokeWidth={2.5} />
            Rekomendasikan ke Pusat
          </button>

        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pb-4 custom-scrollbar">
          
          {/* Gemini AI Recommendation */}
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-md p-6 relative overflow-hidden">
            {/* Decorative Sparkles */}
            <div className="absolute top-2 right-4 opacity-50 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" fill="#A7F3D0"/>
                <path d="M5 18L5.5 20.5L8 21L5.5 21.5L5 24L4.5 21.5L2 21L4.5 20.5L5 18Z" fill="#A7F3D0"/>
                <path d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z" fill="#A7F3D0"/>
              </svg>
            </div>
            
            <div className="flex items-center gap-2 mb-3 text-[#065F46] relative z-10">
              <Sparkles size={20} strokeWidth={2.5} />
              <h3 className="text-[16px] font-extrabold tracking-tight">Rekomendasi Gemini AI</h3>
            </div>
            <p className="text-[15px] text-[#065F46] leading-relaxed relative z-10 pr-12">
              Berdasarkan analisis citra satelit dan data curah hujan BMKG, Kabupaten Bone diprediksi mengalami lonjakan kebutuhan Urea sebesar 11.8% pada MT I. Disarankan untuk segera melakukan realokasi kuota dari wilayah surplus guna mencegah kegagalan tanam.
            </p>
          </div>

          {/* Bar Chart Mockup */}
          <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
            <h3 className="text-[16px] font-extrabold text-[#113224] mb-8">Tren Kebutuhan Urea - 6 Bulan Terakhir</h3>
            
            <div className="h-[200px] flex flex-col justify-end gap-0 w-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-gray-100 w-full border-dashed"></div>
                <div className="border-t border-gray-100 w-full border-dashed"></div>
                <div className="border-t border-gray-100 w-full border-dashed"></div>
                <div className="border-t border-gray-200 w-full"></div>
              </div>
              
              <div className="flex justify-around items-end h-[160px] relative z-10 px-8">
                 {/* Mei */}
                 <div className="flex gap-1.5 items-end">
                   <div className="w-5 h-[90px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                   <div className="w-5 h-[95px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                 </div>
                 {/* Jun */}
                 <div className="flex gap-1.5 items-end">
                   <div className="w-5 h-[85px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                   <div className="w-5 h-[88px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                 </div>
                 {/* Jul */}
                 <div className="flex gap-1.5 items-end">
                   <div className="w-5 h-[105px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                   <div className="w-5 h-[115px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                 </div>
                 {/* Ags */}
                 <div className="flex gap-1.5 items-end">
                   <div className="w-5 h-[100px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                   <div className="w-5 h-[110px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                 </div>
                 {/* Sep */}
                 <div className="flex gap-1.5 items-end">
                   <div className="w-5 h-[120px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                   <div className="w-5 h-[135px] bg-[#B91C1C] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                 </div>
                 {/* Okt */}
                 <div className="flex gap-1.5 items-end">
                   <div className="w-5 h-[120px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                   <div className="w-5 h-[140px] bg-[#B91C1C] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                 </div>
              </div>

              <div className="flex justify-around items-center px-8 mt-4 text-[12px] font-bold text-gray-700">
                 <span>Mei</span><span>Jun</span><span>Jul</span><span>Ags</span><span>Sep</span><span>Okt</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-8">
               <div className="flex items-center gap-2 text-[12px] font-bold text-[#113224]">
                 <div className="w-3.5 h-3.5 bg-[#3f5d56] rounded-sm"></div> Kuota Alokasi
               </div>
               <div className="flex items-center gap-2 text-[12px] font-bold text-[#113224]">
                 <div className="w-3.5 h-3.5 bg-[#006B4D] rounded-sm"></div> Prediksi AI
               </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-[16px] font-extrabold text-[#113224]">Histori Peringatan WhatsApp</h3>
               <button className="text-[12px] font-bold text-[#006B4D] hover:text-[#00573E] flex items-center gap-1 transition-colors">
                 Lihat Semua <ArrowRight size={14} strokeWidth={2.5} />
               </button>
             </div>
             <table className="w-full text-left">
               <thead>
                 <tr>
                   <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-[140px]">Tanggal</th>
                   <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pesan</th>
                   <th className="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-[120px]">Status</th>
                 </tr>
               </thead>
               <tbody className="text-[13px] text-gray-700">
                 <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6">12 Okt 2026</td>
                   <td className="py-4 px-6">Peringatan Defisit Urea MT I</td>
                   <td className="py-4 px-6">
                     <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded text-[11px] font-bold border border-[#A7F3D0]">
                       <Check size={12} strokeWidth={2.5}/> Dibaca
                     </span>
                   </td>
                 </tr>
                 <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6">05 Okt 2026</td>
                   <td className="py-4 px-6">Pembaruan Data Cuaca BMKG</td>
                   <td className="py-4 px-6">
                     <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded text-[11px] font-bold border border-[#A7F3D0]">
                       <Check size={12} strokeWidth={2.5}/> Dibaca
                     </span>
                   </td>
                 </tr>
                 <tr className="hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6">01 Okt 2026</td>
                   <td className="py-4 px-6">Alokasi e-RDKK MT I Terbit</td>
                   <td className="py-4 px-6">
                     <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] font-bold border border-gray-200">
                       <Check size={12} strokeWidth={2.5}/> Terkirim
                     </span>
                   </td>
                 </tr>
               </tbody>
             </table>
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
