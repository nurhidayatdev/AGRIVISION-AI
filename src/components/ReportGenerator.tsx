import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  Home,
  Settings2,
  FileText,
  Sparkles,
  CheckCircle2,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export default function ReportGenerator({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
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
            <button className="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Cetak Laporan</button>
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
          <button onClick={() => onNavigate('dashboard')} className="hover:text-gray-700 transition-colors flex items-center">
            <Home size={14} strokeWidth={2.5} />
          </button>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors">Pelaporan</span>
          <span>/</span>
          <span className="text-gray-900">Generator Eksekutif PDF</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Left Panel: Parameter Laporan */}
        <div className="w-[340px] bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Settings2 size={24} className="text-[#006B4D]" strokeWidth={2.5} />
            <h2 className="text-[18px] font-extrabold text-[#113224]">Parameter Laporan</h2>
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1">
            {/* Periode */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode Pelaporan</label>
              <div className="relative">
                <select className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                  <option>Q3 - Juli s/d September 2024</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Wilayah */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cakupan Wilayah</label>
              <div className="relative">
                <select className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                  <option>Nasional - Seluruh Provinsi</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={16} strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-gray-100 w-full my-2"></div>

            {/* Komoditas */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pilih Komoditas Pupuk</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 bg-[#006B4D] rounded flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-gray-700 font-medium">Urea</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 bg-[#006B4D] rounded flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-gray-700 font-medium">NPK</span>
                </label>
              </div>
            </div>

            {/* Toggle Gemini AI */}
            <div className="border border-gray-200 rounded-md p-4 mt-2">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-[#006B4D] text-white p-1 rounded">
                    <Sparkles size={14} strokeWidth={2.5} />
                  </div>
                  <span className="font-extrabold text-[13px] text-[#113224]">Sertakan Analisis Naratif<br/>Gemini AI</span>
                </div>
                {/* Toggle Switch */}
                <div className="w-10 h-6 bg-[#006B4D] rounded-full p-1 cursor-pointer flex items-center justify-end shrink-0">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed pr-4 mt-3">
                Generasi otomatis ringkasan eksekutif dan rekomendasi kebijakan berdasarkan data spasial.
              </p>
            </div>
            
            <div className="flex-1"></div>

            {/* Warning Box */}
            <div className="bg-[#D1FAE5] rounded-md p-4 flex gap-3 text-[#065F46]">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-[12px] font-medium leading-relaxed">
                Dokumen ini akan disahkan dengan Digital e-Sign BSSN. Pastikan parameter yang dipilih telah sesuai sebelum eksekusi.
              </p>
            </div>

            {/* Generate Button */}
            <button className="w-full bg-[#113224] hover:bg-[#022C22] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[13px] tracking-widest shadow-sm">
              <FileText size={16} strokeWidth={2.5} />
              GENERATE LAPORAN PDF
            </button>
          </div>
        </div>

        {/* Right Panel: AI Monitor */}
        <div className="flex-1 bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-gray-700" strokeWidth={2.5} />
              <h2 className="text-[18px] font-extrabold text-[#113224]">AI Processing Monitor</h2>
            </div>
            <div className="bg-[#ECFDF5] border border-[#10B981] text-[#059669] px-3 py-1.5 rounded-sm flex items-center gap-2 text-[11px] font-bold tracking-widest">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
              GENERATING
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col justify-center max-w-[800px] mx-auto w-full">
            {/* Loading Status Area */}
            <div className="flex flex-col items-center justify-center mb-10 text-center">
              <div className="w-16 h-16 rounded-xl border-4 border-[#34D399] flex items-center justify-center mb-6 relative">
                 <Sparkles size={32} className="text-[#006B4D]" strokeWidth={2} />
                 {/* Decorative dots to simulate scanning/loading */}
                 <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#34D399] rounded-full animate-ping"></div>
              </div>
              <h3 className="text-[20px] font-extrabold text-[#113224] mb-2 tracking-tight">Menghubungkan ke Gemini AI...</h3>
              <p className="text-[14px] text-gray-500">Menganalisis matriks spasial & kompilasi data cuaca histori...</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full mb-8">
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-2 tracking-widest uppercase">
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#006B4D] rounded-full w-[65%] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                </div>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="w-full bg-[#042f2e] rounded-md overflow-hidden shadow-lg border border-[#134e4a] flex flex-col h-[280px]">
              {/* Terminal Header */}
              <div className="bg-[#022c22] px-4 py-2.5 border-b border-[#134e4a] flex items-center shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                </div>
                <div className="ml-4 text-[#4ade80]/60 text-[10px] font-mono tracking-widest uppercase">
                  Secure Kernel Log : PID 8492
                </div>
              </div>
              
              {/* Terminal Body */}
              <div className="p-5 font-mono text-[12px] leading-relaxed overflow-y-auto custom-scrollbar flex-1 text-[#a7f3d0]">
                <div className="flex gap-4 mb-2">
                  <span className="text-[#4ade80]/50 shrink-0">14:02:01</span>
                  <span><span className="text-white font-bold">[OK]</span> Inisialisasi koneksi server database AgriData v2.4</span>
                </div>
                <div className="flex gap-4 mb-2">
                  <span className="text-[#4ade80]/50 shrink-0">14:02:04</span>
                  <span><span className="text-white font-bold">[OK]</span> Ekstraksi 24 Kabupaten pada region Jawa-Bali selesai</span>
                </div>
                <div className="flex gap-4 mb-2">
                  <span className="text-[#4ade80]/50 shrink-0">14:02:11</span>
                  <span><span className="text-white font-bold">[OK]</span> Sinkronisasi API Satelit LAPAN untuk indeks vegetasi (NDVI)</span>
                </div>
                <div className="flex gap-4 mb-2">
                  <span className="text-[#4ade80]/50 shrink-0">14:02:18</span>
                  <span><span className="text-white font-bold">[OK]</span> Validasi data anomali cuaca BMKG selesai</span>
                </div>
                <div className="flex gap-4 mb-5 text-[#fbbf24]">
                  <span className="text-[#4ade80]/50 shrink-0">14:02:22</span>
                  <span><span className="font-bold">[WARN]</span> Null value detected in sensor ID_773, interpolating fallback data...</span>
                </div>
                <div className="flex gap-4 mb-2">
                  <span className="text-[#4ade80]/50 shrink-0">14:02:30</span>
                  <span className="flex items-center flex-wrap">
                    <span className="bg-[#10B981] text-[#042f2e] font-bold px-1.5 py-0.5 rounded-sm mr-2 leading-none uppercase tracking-wider text-[10px]">[PROCESSING]</span> 
                    Gemini AI sedang menghitung rasio defisit Urea dan NPK...
                    <span className="inline-block w-2 h-3.5 bg-[#4ade80] ml-2 animate-pulse"></span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
