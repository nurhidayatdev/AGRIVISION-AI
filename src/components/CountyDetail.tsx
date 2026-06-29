import { useState, useEffect } from 'react';
import logo from '../assets/logo_agrivision_ai.png';
import {
  ArrowLeft,
  AlertTriangle,
  Printer,
  Download,
  Sparkles,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function CountyDetail({ 
  onLogout, 
  onNavigate, 
  idKabupaten 
}: { 
  onLogout: () => void, 
  onNavigate: (page: string, id?: number) => void,
  idKabupaten: number | null
}) {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = `http://localhost/AGRIVISION-AI/backend_php/api_detail_kabupaten.php?id_kabupaten=${idKabupaten}`;
  const GEMINI_URL = 'http://localhost/AGRIVISION-AI/backend_php/api_proses_gemini.php';

  const fetchDetail = async () => {
    if (!idKabupaten) {
      setError('ID Kabupaten tidak valid.');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(BACKEND_URL, { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setData(result.data.detail);
        setHistory(result.data.history);
      } else {
        setError(result.message || 'Gagal memuat detail');
        if (res.status === 401) onLogout();
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [idKabupaten, onLogout]);

  const handleRunGemini = async () => {
    if (!data?.id) return;
    try {
      const res = await fetch(`${GEMINI_URL}?id_alokasi=${data.id}`, {
        credentials: 'include'
      });
      const result = await res.json();
      if (result.status === 'success') {
        await fetchDetail();
        alert('AI Gemini berhasil dianalisis ulang!');
      } else {
        alert('Gagal: ' + result.message);
      }
    } catch (err) {
      alert('Error menghubungi server Gemini');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">Memuat data Detail...</div>;
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

  const status_risiko = data.status_risiko?.toUpperCase() || 'AMAN';
  const is_defisit = status_risiko === 'KRITIS' || status_risiko === 'DEFISIT';
  const status_bg = is_defisit ? 'bg-[#B91C1C]' : (status_risiko === 'WASPADA' ? 'bg-[#D97706]' : 'bg-[#059669]');
  
  const prediksi_urea = data.prediksi_urea || 0;
  const kuota_urea = data.kuota_urea || 0;
  const defisit = prediksi_urea - kuota_urea;
  const defisit_pct = kuota_urea > 0 ? (defisit / kuota_urea) * 100 : 0;

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

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
            <button onClick={() => onNavigate('kelola_data')} className="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Kelola Data</button>
            <button onClick={() => onNavigate('cetak_laporan')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Cetak Laporan</button>
            <button onClick={() => onNavigate('users')} className="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Pengguna</button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[13px] font-medium text-gray-500 gap-2">
            <button onClick={() => onNavigate('dashboard')} className="mr-2 text-gray-700 hover:text-gray-900 transition-colors">
                <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-gray-900 cursor-pointer transition-colors">Beranda</button>
            <span className="text-gray-400">›</span>
            <button onClick={() => onNavigate('kelola_data')} className="hover:text-gray-900 cursor-pointer transition-colors">Kelola Data</button>
            <span className="text-gray-400">›</span>
            <span className="text-[#113224] font-bold">{data.nama_kabupaten}</span>
        </div>
        <div className="flex items-center gap-5 text-[12px] font-bold text-gray-600">
            <a href={`http://localhost/AGRIVISION-AI/backend_php/proses_cetak_pdf.php?musim_tanam=${data.musim_tanam}&id_kabupaten=${data.id_kabupaten}&sertakan_ai=true`} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Download size={14} strokeWidth={2.5} /> Unduh
            </a>
            <a href={`http://localhost/AGRIVISION-AI/backend_php/proses_cetak_pdf.php?musim_tanam=${data.musim_tanam}&id_kabupaten=${data.id_kabupaten}&sertakan_ai=true`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Printer size={14} strokeWidth={2.5} /> Cetak
            </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Left Column */}
        <div className="w-[320px] flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
            
            {/* Main Info Card */}
            <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                <div className="flex justify-between items-start mb-1">
                    <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight">{data.nama_kabupaten}</h1>
                    <span className={`${status_bg} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none mt-1.5`}>{status_risiko}</span>
                </div>
                <p className="text-[13px] text-gray-500 mb-6">BPS Code: {data.kode_bps || '-'}</p>
                
                <div className="h-[1px] bg-gray-100 w-full mb-5"></div>
                
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Luas Tanam</div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[20px] font-extrabold text-[#113224] tracking-tight">{formatNumber(data.luas_lahan)}</span>
                    <span className="text-[14px] font-bold text-[#113224]">Ha</span>
                </div>
            </div>

            {/* Quota vs Prediction Card */}
            <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                 <div className="flex items-center gap-2 mb-2 text-[#006B4D]">
                     <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Kuota Urea Saat Ini</span>
                 </div>
                 <div className="flex items-baseline gap-1.5 mb-6">
                     <span className="text-[32px] font-extrabold text-[#113224] leading-none tracking-tighter">{formatNumber(kuota_urea)}</span>
                     <span className="text-[12px] font-bold text-gray-500">Ton</span>
                 </div>

                 <div className="flex items-center gap-2 mb-2 text-[#006B4D]">
                     <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Prediksi Kebutuhan AI</span>
                 </div>
                 <div className="flex items-baseline gap-1.5 mb-6">
                     <span className="text-[32px] font-extrabold text-[#113224] leading-none tracking-tighter">{formatNumber(prediksi_urea)}</span>
                     <span className="text-[12px] font-bold text-gray-500">Ton</span>
                 </div>

                 {defisit > 0 ? (
                 <div className="bg-red-50 border border-red-100 rounded p-4 flex flex-col gap-1.5 items-start">
                     <div className="flex items-center gap-1.5 text-[#DC2626]">
                         <span className="text-[11px] font-bold uppercase tracking-wider">Status Pasokan</span>
                     </div>
                     <span className="text-[16px] font-extrabold text-[#DC2626] tracking-tight">Defisit {formatNumber(defisit)} Ton ({defisit_pct.toFixed(1)}%)</span>
                 </div>
                 ) : (
                 <div className="bg-emerald-50 border border-emerald-100 rounded p-4 flex flex-col gap-1.5 items-start">
                     <div className="flex items-center gap-1.5 text-[#059669]">
                         <span className="text-[11px] font-bold uppercase tracking-wider">Status Pasokan</span>
                     </div>
                     <span className="text-[16px] font-extrabold text-[#059669] tracking-tight">Surplus/Aman</span>
                 </div>
                 )}
            </div>

            {/* Action Button */}
            <button onClick={handleRunGemini} className="w-full bg-[#006B4D] hover:bg-[#00573E] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] shadow-sm tracking-wide">
                <Sparkles size={18} strokeWidth={2.5} />
                Jalankan Gemini AI Ulang
            </button>

        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pb-4 custom-scrollbar">
            
            {/* Gemini AI Recommendation */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-md p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-[#065F46] relative z-10">
                    <Sparkles size={20} strokeWidth={2.5} />
                    <h3 className="text-[16px] font-extrabold tracking-tight">Rekomendasi Gemini AI</h3>
                </div>
                <p className="text-[15px] text-[#065F46] leading-relaxed relative z-10 pr-12">
                    {data.narasi_rekomendasi || 'Belum ada rekomendasi yang di-generate. Silakan jalankan Gemini AI untuk menganalisis data wilayah ini.'}
                </p>
                {data.cuaca_anomali && (
                <div className="mt-4 pt-4 border-t border-[#A7F3D0]/50 text-[13px] text-[#065F46] font-medium">
                    <span className="font-bold">Kondisi Cuaca (BMKG):</span> {data.cuaca_anomali}
                </div>
                )}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="text-[16px] font-extrabold text-[#113224]">Histori Peringatan WhatsApp</h3>
                     <button onClick={() => onNavigate('notifications')} className="text-[12px] font-bold text-[#006B4D] hover:text-[#00573E] flex items-center gap-1 transition-colors">
                         Lihat Semua
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
                         {history.length > 0 ? history.map((h, i) => (
                             <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                 <td className="py-4 px-6">{new Date(h.dikirim_pada).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                                 <td className="py-4 px-6 truncate max-w-[250px]" title={h.pesan_ai}>{h.pesan_ai}</td>
                                 <td className="py-4 px-6">
                                     <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded text-[11px] font-bold border border-[#A7F3D0]">
                                         <CheckCircle size={12} strokeWidth={2.5} /> Dibaca
                                     </span>
                                 </td>
                             </tr>
                         )) : (
                             <tr>
                                 <td colSpan={3} className="py-4 px-6 text-center text-gray-400">Belum ada histori peringatan.</td>
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
