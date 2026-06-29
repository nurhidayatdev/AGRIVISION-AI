import { useState, useEffect } from 'react';
import logo from '../assets/logo_agrivision_ai.png';
import { supabase } from '../utils/supabaseClient';
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
  LogOut,
  AlertTriangle
} from 'lucide-react';

export default function DataManagement({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
  const [data, setData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const sessionStr = localStorage.getItem('agrivision_session');
      const userSession = sessionStr ? JSON.parse(sessionStr) : null;

      if (!userSession) {
        onLogout();
        return;
      }
      setUser(userSession);

      const { data: dbData, error: dbError } = await supabase
        .from('data_alokasi_pupuk')
        .select(`
          *,
          master_kabupaten (nama_kabupaten, kode_bps)
        `);

      if (dbError) throw dbError;

      // Map joined data to match the table structure expected by the component
      const formattedData = (dbData || []).map(row => ({
          ...row,
          nama_kabupaten: row.master_kabupaten?.nama_kabupaten,
          kode_bps: row.master_kabupaten?.kode_bps
      }));

      // Aggregate duplicate commodities by kabupaten (summing values)
      const aggMap = new Map();
      formattedData.forEach((row: any) => {
         const id = row.id_kabupaten;
         if (!aggMap.has(id)) {
            aggMap.set(id, { ...row });
         } else {
            const existing = aggMap.get(id);
            existing.luas_lahan = Number(existing.luas_lahan || 0) + Number(row.luas_lahan || 0);
            existing.kuota_urea = Number(existing.kuota_urea || 0) + Number(row.kuota_urea || 0);
            existing.kuota_npk = Number(existing.kuota_npk || 0) + Number(row.kuota_npk || 0);
            existing.prediksi_urea = Number(existing.prediksi_urea || 0) + Number(row.prediksi_urea || 0);
            existing.prediksi_npk = Number(existing.prediksi_npk || 0) + Number(row.prediksi_npk || 0);
            
            const existingStatus = (existing.status_risiko || '').toLowerCase();
            const newStatus = (row.status_risiko || '').toLowerCase();
            if (newStatus === 'kritis' || (newStatus === 'defisit' && existingStatus !== 'kritis') || (newStatus === 'waspada' && existingStatus === 'aman')) {
                existing.status_risiko = row.status_risiko;
            }
         }
      });

      setData(Array.from(aggMap.values()));
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dari Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Supabase Real-time listener
    const subscription = supabase
      .channel('public:data_alokasi_pupuk_mgmt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'data_alokasi_pupuk' }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onLogout]);

  // Helper for formatting numbers
  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">Memuat data...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7F5] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={onLogout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Kembali ke Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#023E2D] text-white flex items-center justify-between pl-6 pr-4 h-[64px] shrink-0">
        {/* Left: Logo & Nav */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <div className="flex items-center mr-10 gap-3">
             <img src={logo} alt="AgriVision AI Logo" className="w-7 h-7 object-contain" />
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
          <button onClick={() => onNavigate('notifications')} className="relative text-white/90 hover:text-white mr-2">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
          </button>
          
          <div className="flex items-center gap-3 border-l border-white/20 pl-6 py-2">
            <div className="text-right">
              <div className="text-[14px] font-bold leading-tight">{user?.nama_lengkap || 'User'}</div>
              <div className="text-[12px] text-white/70 font-medium">{user?.role || 'Role'}</div>
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
                {data.length > 0 ? data.map((row: any, index: number) => {
                  const status = (row.status_risiko || 'aman').toLowerCase();
                  let badgeClass = '';
                  
                  switch(status) {
                    case 'aman':
                      badgeClass = 'bg-emerald-50 text-[#059669] border-emerald-200';
                      break;
                    case 'waspada':
                      badgeClass = 'bg-amber-50 text-[#D97706] border-amber-200';
                      break;
                    case 'kritis':
                    case 'defisit':
                      badgeClass = 'bg-red-50 text-[#DC2626] border-red-200';
                      break;
                    default:
                      badgeClass = 'bg-gray-50 text-gray-600 border-gray-200';
                  }

                  const ureaTrendIcon = row.prediksi_urea > row.kuota_urea 
                    ? <TrendingUp size={14} strokeWidth={2.5} className="text-[#DC2626]"/> 
                    : (row.prediksi_urea < row.kuota_urea ? <TrendingDown size={14} strokeWidth={2.5} className="text-[#059669]"/> : <ArrowRight size={14} strokeWidth={2.5} className="text-gray-500"/>);
                  
                  const npkTrendIcon = row.prediksi_npk > row.kuota_npk 
                    ? <TrendingUp size={14} strokeWidth={2.5} className="text-[#D97706]"/> 
                    : (row.prediksi_npk < row.kuota_npk ? <TrendingDown size={14} strokeWidth={2.5} className="text-[#059669]"/> : <ArrowRight size={14} strokeWidth={2.5} className="text-gray-500"/>);

                  const ureaColor = row.prediksi_urea > row.kuota_urea ? 'text-[#DC2626]' : (row.prediksi_urea < row.kuota_urea ? 'text-[#059669]' : 'text-gray-700');
                  const npkColor = row.prediksi_npk > row.kuota_npk ? 'text-[#D97706]' : (row.prediksi_npk < row.kuota_npk ? 'text-[#059669]' : 'text-gray-700');

                  const bgClass = index % 2 === 1 ? 'bg-[#FAFAFA]' : '';

                  return (
                    <tr key={row.id || index} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${bgClass}`}>
                      <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">{row.kode_bps || '-'}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{row.nama_kabupaten}</td>
                      <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">{formatNumber(row.luas_lahan, 2)}</td>
                      <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">{formatNumber(row.kuota_urea)}</td>
                      <td className={`py-4 px-6 text-right font-bold ${ureaColor} font-mono flex items-center justify-end gap-1.5`}>
                        {formatNumber(row.prediksi_urea)} {ureaTrendIcon}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-700 font-mono">{formatNumber(row.kuota_npk)}</td>
                      <td className={`py-4 px-6 text-right font-bold ${npkColor} font-mono flex items-center justify-end gap-1.5`}>
                        {formatNumber(row.prediksi_npk)} {npkTrendIcon}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider w-[68px] ${badgeClass}`}>
                          {row.status_risiko || 'AMAN'}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="py-10 px-6 text-center text-gray-500 font-medium">Tidak ada data ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500 bg-white rounded-b-md">
            <div>
              Menampilkan total <span className="font-bold text-gray-700">{data.length}</span> data
            </div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">Seb</button>
              <button className="px-3 py-1.5 border border-[#10B981] bg-[#ECFDF5] text-[#059669] font-bold rounded">1</button>
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
