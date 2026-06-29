import { useState, useEffect } from 'react';
import logo from '../assets/logo_agrivision_ai.png';
import {
  Bell,
  User,
  Search,
  Calendar,
  LogOut,
  AlertTriangle
} from 'lucide-react';

export default function NotificationHistory({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string, id?: number) => void }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = 'http://localhost/AGRIVISION-AI/backend_php/api_riwayat_notifikasi.php';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(BACKEND_URL, { credentials: 'include' });
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          setData(result.data);
        } else {
          setError(result.message || 'Gagal memuat riwayat');
          if (res.status === 401) onLogout();
        }
      } catch (err) {
        setError('Gagal terhubung ke server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [onLogout]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">Memuat Notifikasi...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F5F7F5] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => onNavigate('dashboard')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Kembali ke Dashboard</button>
      </div>
    );
  }

  const { logs, summary } = data;

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="bg-[#023E2D] text-white flex items-center justify-between pl-6 pr-4 h-[64px] shrink-0">
        <div className="flex items-center h-full">
          <div className="flex items-center mr-10 gap-3">
             <img src={logo} alt="AgriVision AI Logo" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-[17px] tracking-wide">AGRIVISION AI</span>
          </div>

          <div className="flex items-center h-full text-[15px] font-medium ml-4">
            <button onClick={() => onNavigate('dashboard')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Dashboard</button>
            <button onClick={() => onNavigate('kelola_data')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Data</button>
            <button onClick={() => onNavigate('cetak_laporan')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Cetak Laporan</button>
            <button onClick={() => onNavigate('users')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Pengguna</button>
          </div>
        </div>

        <div className="flex items-center gap-6 h-full">
            <div 
              className="w-10 h-10 rounded-md bg-[#006B4D] flex items-center justify-center border border-white/10 hover:bg-[#00573E] cursor-pointer transition-colors group relative"
              onClick={onLogout}
              title="Logout"
            >
              <User size={18} className="text-white group-hover:hidden" strokeWidth={2.5} />
              <LogOut size={18} className="text-white hidden group-hover:block" strokeWidth={2.5} />
            </div>
        </div>
      </nav>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[13px] font-medium text-gray-500 gap-2">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-gray-900 cursor-pointer transition-colors">Beranda</button>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900">Notifikasi</span>
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
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 p-6 flex flex-col justify-center">
                <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Alert Terkirim</div>
                <div className="text-[42px] font-extrabold text-[#113224] leading-none tracking-tighter">{summary.total_alerts}</div>
            </div>
            
            <div className="bg-white rounded-sm border-y border-r border-gray-200 border-l-4 border-l-[#B91C1C] shadow-sm flex-1 p-6 flex flex-col justify-center">
                <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alert Belum Ditindaklanjuti</div>
                <div className="text-[42px] font-extrabold text-[#B91C1C] leading-none tracking-tighter">{summary.total_pending}</div>
            </div>

            <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 p-6 flex flex-col justify-center">
                <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kabupaten Paling Sering Alert</div>
                <div className="text-[28px] font-extrabold text-[#113224] leading-tight tracking-tight">{summary.top_kabupaten}</div>
            </div>
        </div>

        {/* Filters and Table Container */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 flex flex-col">
            
            {/* Table */}
            <div className="overflow-x-auto flex-1 custom-scrollbar mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[60px]">No</th>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[180px]">Tanggal & Waktu</th>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[140px]">Kabupaten</th>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider">Pesan WhatsApp</th>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[120px]">WA Status</th>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[120px]">Action Status</th>
                            <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[140px]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px]">
                        {logs.length > 0 ? logs.map((log: any, idx: number) => {
                            const status = log.status_tindakan?.toLowerCase() || '';
                            const isPending = ['kritis', 'waspada', 'defisit', 'menunggu'].includes(status);
                            const action_status_class = isPending ? 'bg-amber-100/50 text-[#D97706] border-amber-200' : 'bg-[#D1FAE5]/50 text-[#059669] border-[#A7F3D0]';
                            const action_status_text = isPending ? 'MENUNGGU' : 'SELESAI';
                            
                            const dateObj = new Date(log.dikirim_pada);
                            const diffDays = Math.floor((new Date().getTime() - dateObj.getTime()) / (1000 * 3600 * 24));
                            const wa_status_text = diffDays <= 2 ? 'TERKIRIM' : 'DIBACA';
                            const wa_status_class = diffDays <= 2 ? 'bg-blue-100/50 text-blue-600 border-blue-200' : 'bg-green-100/50 text-green-600 border-green-200';

                            return (
                                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5 px-6 text-gray-500">{idx + 1}</td>
                                    <td className="py-5 px-6 text-gray-600">
                                        {dateObj.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}, {dateObj.getHours().toString().padStart(2, '0')}:{dateObj.getMinutes().toString().padStart(2, '0')} WIB
                                    </td>
                                    <td className="py-5 px-6 font-bold text-gray-900">{log.nama_kabupaten}</td>
                                    <td className="py-5 px-6 text-gray-500 truncate max-w-[250px]" title={log.pesan_ai}>{log.pesan_ai}</td>
                                    
                                    <td className="py-5 px-6 text-center">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${wa_status_class}`}>
                                            {wa_status_text}
                                        </span>
                                    </td>
                                    
                                    <td className="py-5 px-6 text-center">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${action_status_class}`}>
                                            {action_status_text}
                                        </span>
                                    </td>

                                    <td className="py-5 px-6 text-center">
                                        <button 
                                            onClick={() => onNavigate('county_detail', log.id_kabupaten)}
                                            className="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors"
                                        >
                                            Lihat Detail
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="py-10 px-6 text-center text-gray-500 font-medium">Tidak ada riwayat peringatan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </main>
    </div>
  );
}
