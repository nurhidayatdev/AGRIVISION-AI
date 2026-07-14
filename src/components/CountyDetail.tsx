import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { AlokasiPupuk, LaporanPpl } from '../types';
import { supabase } from '../utils/supabaseClient';
import { sendWhatsAppMessage } from '../utils/fonnteClient';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  AlertTriangle,
  Printer,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function CountyDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const idKabupaten = id ? parseInt(id, 10) : null;
  const [data, setData] = useState<AlokasiPupuk & { nama_kabupaten?: string; kode_bps?: string; id?: number } | null>(null);
  const [history, setHistory] = useState<{dikirim_pada: string; pesan_ai: string;}[]>([]);
  const [laporanPpl, setLaporanPpl] = useState<LaporanPpl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

  const fetchDetail = async () => {
    if (!user) return;
    if (!idKabupaten) {
      setError('ID Kabupaten tidak valid.');
      setIsLoading(false);
      return;
    }
    try {
      // 1. Fetch Kabupaten Data
      const { data: detailData, error: detailErr } = await supabase
        .from('data_alokasi_pupuk')
        .select(`
          id_alokasi,
          musim_tanam,
          id_kabupaten,
          luas_lahan,
          status_risiko,
          prediksi_urea,
          kuota_urea,
          prediksi_npk,
          kuota_npk,
          narasi_rekomendasi,
          cuaca_anomali,
          master_kabupaten ( nama_kabupaten, kode_bps )
        `)
        .eq('id_kabupaten', idKabupaten)
        .order('id_alokasi', { ascending: false })
        .limit(1)
        .single();

      if (detailErr) throw detailErr;

      const masterKab = Array.isArray(detailData.master_kabupaten) 
        ? detailData.master_kabupaten[0] 
        : detailData.master_kabupaten;

      const detail = {
        id: detailData.id_alokasi,
        nama_kabupaten: masterKab?.nama_kabupaten,
        kode_bps: masterKab?.kode_bps,
        musim_tanam: detailData.musim_tanam,
        id_kabupaten: detailData.id_kabupaten,
        luas_lahan: detailData.luas_lahan,
        status_risiko: detailData.status_risiko,
        prediksi_urea: detailData.prediksi_urea,
        kuota_urea: detailData.kuota_urea,
        prediksi_npk: detailData.prediksi_npk,
        kuota_npk: detailData.kuota_npk,
        narasi_rekomendasi: detailData.narasi_rekomendasi,
        cuaca_anomali: detailData.cuaca_anomali
      };

      // 2. Fetch Notification History
      const { data: historyData, error: historyErr } = await supabase
        .from('data_alokasi_pupuk')
        .select(`
          last_analyzed_at,
          narasi_rekomendasi
        `)
        .eq('id_kabupaten', idKabupaten)
        .in('status_risiko', ['Kritis', 'Waspada', 'Defisit', 'KRITIS', 'WASPADA', 'DEFISIT', 'kritis', 'waspada', 'defisit'])
        .order('last_analyzed_at', { ascending: false });

      if (historyErr) throw historyErr;

      // 3. Fetch Laporan PPL
      const { data: pplData, error: pplErr } = await supabase
        .from('laporan_ppl')
        .select('*')
        .eq('id_kabupaten', idKabupaten)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pplErr) throw pplErr;

      const historyList = historyData.map((h: {last_analyzed_at: string, narasi_rekomendasi: string}) => ({
        dikirim_pada: h.last_analyzed_at || new Date().toISOString(),
        pesan_ai: h.narasi_rekomendasi
      }));

      setData(detail);
      setHistory(historyList);
      setLaporanPpl(pplData || []);

    } catch (err: unknown) {
      console.error(err);
      setError('Gagal memuat detail dari Supabase: ' + (err instanceof Error ? err.message : JSON.stringify(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [idKabupaten, user]);

  const handleRunGemini = async () => {
    if (!data?.id) return;
    setIsAiLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY belum di set di .env");

      // Bangun Prompt Hibrida
      let promptLaporan = "";
      if (laporanPpl.length > 0) {
        promptLaporan = "Berikut adalah laporan aktual dari Petugas Lapangan (PPL):\n";
        laporanPpl.forEach((l, i) => {
          promptLaporan += `- Kec ${l.nama_kecamatan}: Kondisi ${l.kondisi_lahan}, Usulan tambahan urea ${l.usulan_tambahan_urea} Ton. Catatan: ${l.catatan_lapangan}\n`;
        });
      } else {
        promptLaporan = "Tidak ada laporan khusus dari Petugas Lapangan (PPL).\n";
      }

      const prompt = `Anda adalah AGRIVISION-AI, asisten cerdas untuk Kementerian Pertanian Indonesia. 
Tugas Anda adalah menganalisis data wilayah berikut dan memberikan narasi rekomendasi serta prediksi kebutuhan pupuk urea.
Data Kabupaten: ${data.nama_kabupaten}
Luas Lahan Tanam: ${data.luas_lahan} Ha
Kuota Urea Tersedia: ${data.kuota_urea} Ton
Kondisi Cuaca/Anomali BMKG: ${data.cuaca_anomali || 'Normal'}
${promptLaporan}

Berdasarkan gabungan data cuaca BMKG dan laporan PPL di atas:
1. Hitung ulang total prediksi kebutuhan urea (dalam angka Ton) dengan mempertimbangkan luas lahan, potensi gagal panen akibat cuaca, dan usulan spesifik dari PPL.
2. Tentukan status risiko wilayah saat ini. Pilihan: Aman, Waspada, Defisit, atau Kritis.
3. Buat narasi rekomendasi aksi singkat untuk Admin Kabupaten dan PPL (maksimal 3 kalimat).

Anda HARUS membalas HANYA dengan format JSON yang valid dan tanpa format markdown (tanpa \`\`\`json). Contoh:
{
  "prediksi_urea": 1205.5,
  "status_risiko": "Kritis",
  "narasi_rekomendasi": "Ditemukan banjir di beberapa kecamatan. Rekomendasi tambahan urea mendesak segera didistribusikan."
}`;

      // Call Gemini API directly from Frontend
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 }
        })
      });

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) throw new Error(geminiData.error?.message || "Error dari Gemini API");

      const responseText = geminiData.candidates[0].content.parts[0].text;
      
      // Bersihkan json yang kemungkinan kotor
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      // 1. Simpan ke Supabase (tabel data_alokasi_pupuk)
      const { error: updateErr } = await supabase
        .from('data_alokasi_pupuk')
        .update({
          prediksi_urea: parsed.prediksi_urea,
          status_risiko: parsed.status_risiko,
          narasi_rekomendasi: parsed.narasi_rekomendasi,
          last_analyzed_at: new Date().toISOString()
        })
        .eq('id_alokasi', data.id);

      if (updateErr) throw updateErr;

      // 2. Fonnte WhatsApp Broadcast jika berisiko tinggi
      const statusUpper = String(parsed.status_risiko).toUpperCase();
      if (statusUpper === 'KRITIS' || statusUpper === 'DEFISIT' || statusUpper === 'WASPADA') {
        const { data: usersData } = await supabase
          .from('users')
          .select('nomor_wa, nama_lengkap, role, nama_kecamatan')
          .eq('id_kabupaten', idKabupaten)
          .not('nomor_wa', 'is', null);

        if (usersData && usersData.length > 0) {
          for (const user of usersData) {
            if (user.nomor_wa) {
              const pesanWa = `Halo, *${user.nama_lengkap}*!\n\n⚠️ *AGRIVISION-AI ALERT* ⚠️\n*Wilayah:* Kab. ${data.nama_kabupaten} ${user.role === 'PPL' ? '(Kec. ' + user.nama_kecamatan + ')' : ''}\n*Status:* ${statusUpper}\n*Rekomendasi:* ${parsed.narasi_rekomendasi}\n\nSilakan login ke sistem untuk melihat detail selengkapnya.`;
              await sendWhatsAppMessage(user.nomor_wa, pesanWa);
            }
          }
        }
      }

      await fetchDetail();
      setModalConfig({ title: 'Berhasil', message: 'AI Gemini berhasil dianalisis ulang, dan WhatsApp Notifikasi telah diproses.', type: 'success' });
      setShowModal(true);

    } catch (err: unknown) {
      console.error(err);
      setModalConfig({ title: 'Gagal', message: 'Gagal menjalankan Gemini: ' + (err instanceof Error ? err.message : String(err)), type: 'error' });
      setShowModal(true);
    } finally {
      setIsAiLoading(false);
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
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Kembali ke Dashboard</button>
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

  const prediksi_npk = data.prediksi_npk || 0;
  const kuota_npk = data.kuota_npk || 0;
  const defisit_npk = prediksi_npk - kuota_npk;
  const defisit_npk_pct = kuota_npk > 0 ? (defisit_npk / kuota_npk) * 100 : 0;

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
      
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 h-auto min-h-[48px] py-2 md:py-0 md:h-[60px] flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[10px] md:text-[11px] font-bold tracking-widest text-gray-400 gap-1 md:gap-2 uppercase flex-wrap">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</button>
            <span>/</span>
            <button onClick={() => navigate('/kelola_data')} className="hover:text-gray-700 cursor-pointer transition-colors">KELOLA DATA</button>
            <span>/</span>
            <span className="text-gray-900">{data.nama_kabupaten}</span>
        </div>
        <div className="flex items-center gap-5 text-[12px] font-bold text-gray-600">
            <a 
                href={`/api/cetak-pdf?musim_tanam=${data.musim_tanam}&id_kabupaten=${data.id_kabupaten}&sertakan_ai=true`}
                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                title="Fitur unduh membutuhkan PHP backend">
                <Download size={14} strokeWidth={2.5} /> Unduh
            </a>
            <a 
                href={`/api/cetak-pdf?musim_tanam=${data.musim_tanam}&id_kabupaten=${data.id_kabupaten}&sertakan_ai=true`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                title="Fitur cetak membutuhkan PHP backend">
                <Printer size={14} strokeWidth={2.5} /> Cetak
            </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Left Column */}
        <div className="w-full md:w-[320px] flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
            
            {/* Main Info Card */}
            <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                <div className="flex justify-between items-start mb-1">
                    <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight">{data.nama_kabupaten}</h1>
                    <span className={`${status_bg} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none mt-1.5`}>{status_risiko}</span>
                </div>
                <p className="text-[13px] text-gray-500 mb-6">BPS Code: {data.kode_bps || '-'}</p>
                
                <div className="h-px bg-gray-100 w-full mb-5"></div>
                
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Luas Tanam</div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[20px] font-extrabold text-[#113224] tracking-tight">{formatNumber(data.luas_lahan)}</span>
                    <span className="text-[14px] font-bold text-[#113224]">Ha</span>
                </div>
            </div>

            {/* Quota vs Prediction Card */}
            <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                 <div className="grid grid-cols-2 gap-3">
                   <div className="flex flex-col">
                     <div className="mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-tight block mb-0.5">Kuota Urea Saat Ini</span>
                         <div className="flex flex-wrap items-baseline gap-1">
                             <span className="text-[20px] font-extrabold text-[#113224] leading-none tracking-tight">{formatNumber(kuota_urea)}</span>
                             <span className="text-[11px] font-bold text-gray-500">Ton</span>
                         </div>
                     </div>
                     
                     <div className="mb-5">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-tight block mb-0.5">Prediksi AI (Urea)</span>
                         <div className="flex flex-wrap items-baseline gap-1">
                             <span className="text-[20px] font-extrabold text-[#113224] leading-none tracking-tight">{formatNumber(prediksi_urea)}</span>
                             <span className="text-[11px] font-bold text-gray-500">Ton</span>
                         </div>
                     </div>
                     
                     <div className="mt-auto">
                       {defisit > 0 ? (
                       <div className="bg-red-50 border border-red-100 rounded p-2.5 flex flex-col gap-1 items-start">
                           <span className="text-[9px] font-bold uppercase tracking-wider text-[#DC2626]">Status (Urea)</span>
                           <span className="text-[12px] font-extrabold text-[#DC2626] tracking-tight">Defisit {formatNumber(defisit)}T</span>
                       </div>
                       ) : (
                       <div className="bg-emerald-50 border border-emerald-100 rounded p-2.5 flex flex-col gap-1 items-start">
                           <span className="text-[9px] font-bold uppercase tracking-wider text-[#059669]">Status (Urea)</span>
                           <span className="text-[12px] font-extrabold text-[#059669] tracking-tight">Surplus/Aman</span>
                       </div>
                       )}
                     </div>
                   </div>
                   
                   <div className="flex flex-col">
                     <div className="mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-tight block mb-0.5">Kuota NPK Saat Ini</span>
                         <div className="flex flex-wrap items-baseline gap-1">
                             <span className="text-[20px] font-extrabold text-[#113224] leading-none tracking-tight">{formatNumber(kuota_npk)}</span>
                             <span className="text-[11px] font-bold text-gray-500">Ton</span>
                         </div>
                     </div>
                     
                     <div className="mb-5">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-tight block mb-0.5">Prediksi AI (NPK)</span>
                         <div className="flex flex-wrap items-baseline gap-1">
                             <span className="text-[20px] font-extrabold text-[#113224] leading-none tracking-tight">{formatNumber(prediksi_npk)}</span>
                             <span className="text-[11px] font-bold text-gray-500">Ton</span>
                         </div>
                     </div>
                     
                     <div className="mt-auto">
                       {defisit_npk > 0 ? (
                       <div className="bg-red-50 border border-red-100 rounded p-2.5 flex flex-col gap-1 items-start">
                           <span className="text-[9px] font-bold uppercase tracking-wider text-[#DC2626]">Status (NPK)</span>
                           <span className="text-[12px] font-extrabold text-[#DC2626] tracking-tight">Defisit {formatNumber(defisit_npk)}T</span>
                       </div>
                       ) : (
                       <div className="bg-emerald-50 border border-emerald-100 rounded p-2.5 flex flex-col gap-1 items-start">
                           <span className="text-[9px] font-bold uppercase tracking-wider text-[#059669]">Status (NPK)</span>
                           <span className="text-[12px] font-extrabold text-[#059669] tracking-tight">Surplus/Aman</span>
                       </div>
                       )}
                     </div>
                   </div>
                 </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleRunGemini} 
              disabled={isAiLoading}
              className={`w-full font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] shadow-sm tracking-wide ${isAiLoading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#006B4D] hover:bg-[#00573E] text-white'}`}
            >
                {isAiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} strokeWidth={2.5} />
                    Jalankan Gemini AI Ulang
                  </>
                )}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Laporan PPL Terkini */}
                <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col h-[350px]">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
                        <h3 className="text-[14px] font-extrabold text-[#113224] flex items-center gap-2">
                          <FileText size={16} /> Laporan Lapangan PPL
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {laporanPpl.length > 0 ? laporanPpl.map((l: LaporanPpl) => (
                            <div key={l.id_laporan} className="border border-gray-100 rounded-md p-3 text-[12px] bg-white">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-[#113224]">{l.nama_kecamatan}</span>
                                    <span className="text-gray-400 font-medium">
                                        {new Date(l.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                        l.kondisi_lahan === 'Kekeringan' ? 'bg-orange-100 text-orange-700' :
                                        l.kondisi_lahan === 'Banjir' ? 'bg-blue-100 text-blue-700' :
                                        l.kondisi_lahan === 'Serangan Hama' ? 'bg-red-100 text-red-700' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {l.kondisi_lahan}
                                    </span>
                                    {l.usulan_tambahan_urea > 0 && (
                                        <span className="ml-2 font-bold text-[#006B4D]">+ {l.usulan_tambahan_urea} Ton</span>
                                    )}
                                </div>
                                <p className="text-gray-600 line-clamp-2">"{l.catatan_lapangan}"</p>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                                <FileText size={32} className="opacity-20 mb-2" />
                                <span>Belum ada laporan PPL untuk kabupaten ini.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Peringatan Table */}
                <div className="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col h-[350px]">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
                        <h3 className="text-[14px] font-extrabold text-[#113224] flex items-center gap-2">
                          <AlertTriangle size={16} /> Histori Peringatan WA
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white shadow-[0_1px_2px_rgb(0,0,0,0.05)]">
                                <tr>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-[100px]">Tanggal</th>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Rekomendasi</th>
                                </tr>
                            </thead>
                            <tbody className="text-[12px] text-gray-700">
                                {history.length > 0 ? history.map((h, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap">{new Date(h.dikirim_pada).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                                        <td className="py-3 px-4 whitespace-pre-wrap leading-relaxed">{h.pesan_ai}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="py-10 px-6 text-center text-gray-400">Belum ada peringatan kritis.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>

      </main>
      
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalConfig.type === 'success' ? 'bg-[#D1DFD9] text-[#10B981]' : 'bg-red-100 text-red-500'}`}>
                {modalConfig.type === 'success' ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <AlertCircle size={32} strokeWidth={2.5} />}
              </div>
              <h3 className="text-xl font-extrabold text-[#113224] mb-2">{modalConfig.title}</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                {modalConfig.message}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-[#113224] hover:bg-[#022C22] text-white font-bold py-3 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
