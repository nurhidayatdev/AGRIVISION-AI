import { useState, useEffect } from 'react';
import Navbar from './Navbar';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

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

  const filteredData = data.filter((row: any) => {
    const matchSearch = row.nama_kabupaten?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        row.kode_bps?.includes(searchQuery);
    const matchStatus = statusFilter === 'Semua Status' || 
                        (row.status_risiko || 'aman').toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} onLogout={onLogout} activePage="kelola_data" />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</button>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Aman">Aman</option>
                <option value="Waspada">Waspada</option>
                <option value="Kritis">Kritis</option>
                <option value="Defisit">Defisit</option>
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
                {filteredData.length > 0 ? filteredData.map((row: any, index: number) => {
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
              Menampilkan total <span className="font-bold text-gray-700">{filteredData.length}</span> data
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
