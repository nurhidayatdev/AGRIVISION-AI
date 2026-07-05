import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  Bell,
  User,
  ChevronDown,
  Download,
  AlertTriangle,
  TrendingDown,
  Clock,
  Plus,
  Minus,
  Crosshair,
  Sparkles,
  LogOut,
  MapPin
} from 'lucide-react';
import Navbar from './Navbar';

export default function Dashboard({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string, id?: number) => void }) {
  const [data, setData] = useState<any>(null);
  const [activeFocusArea, setActiveFocusArea] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState('');
  const [error, setError] = useState('');
  
  const mapRef = useRef<any>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerLayerRef = useRef<any>(null);

  const fetchDashboardData = async () => {
    try {
      const sessionStr = localStorage.getItem('agrivision_session');
      const userSession = sessionStr ? JSON.parse(sessionStr) : null;

      if (!userSession) {
        onLogout();
        return;
      }

      let query = supabase
        .from('data_alokasi_pupuk')
        .select(`
          *,
          master_kabupaten (nama_kabupaten, koordinat_lat, koordinat_lng)
        `);

      if (!userSession.is_provinsi_admin && userSession.id_kabupaten) {
        query = query.eq('id_kabupaten', userSession.id_kabupaten);
      }

      const { data: allData, error: dbError } = await query;

      if (dbError) throw dbError;

      let totalLahan = 0, totalUrea = 0, totalNpk = 0;
      const mapDataMap = new Map();
      const kritisData: any[] = [];

      allData?.forEach((row: any) => {
        totalLahan += Number(row.luas_lahan) || 0;
        totalUrea += Number(row.kuota_urea) || 0;
        totalNpk += Number(row.kuota_npk) || 0;

        const idKab = row.id_kabupaten;
        const status = (row.status_risiko || '').toLowerCase();
        
        // Safely extract master_kabupaten in case Supabase returns an array
        const masterKab = Array.isArray(row.master_kabupaten) ? row.master_kabupaten[0] : row.master_kabupaten;
        
        if (status === 'kritis' || status === 'defisit' || status === 'waspada') {
           if (kritisData.length < 5) {
               kritisData.push({
                   ...row,
                   nama_kabupaten: masterKab?.nama_kabupaten
               });
           }
        }

        if (!mapDataMap.has(idKab) || status === 'kritis' || status === 'defisit') {
            mapDataMap.set(idKab, {
                ...row,
                nama_kabupaten: masterKab?.nama_kabupaten,
                koordinat_lat: masterKab?.koordinat_lat,
                koordinat_lng: masterKab?.koordinat_lng
            });
        }
      });

      const map_data = Array.from(mapDataMap.values());
      const focus_area = kritisData.length > 0 ? kritisData[0] : (map_data.length > 0 ? map_data[0] : null);

      setData({
          totals: {
              lahan: totalLahan,
              urea: totalUrea,
              npk: totalNpk
          },
          kritis_data: kritisData,
          map_data: map_data,
          user: userSession
      });
      setActiveFocusArea(focus_area);

    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke database Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up Supabase Realtime Subscription!
    const subscription = supabase
      .channel('public:data_alokasi_pupuk')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'data_alokasi_pupuk' }, payload => {
        console.log('Realtime change received!', payload);
        // Refresh data automatically
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onLogout]);

  // Initialize Leaflet Map and Update Markers
  useEffect(() => {
    if (!data || !mapContainer.current || !(window as any).L) return;
    const L = (window as any).L;

    // 1. Initialize Map once
    if (!mapRef.current) {
      const map = L.map(mapContainer.current).setView([-4.6, 119.8], 7);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Create a layer group for markers
      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    // 2. Update Markers
    if (markerLayerRef.current && data.map_data) {
      markerLayerRef.current.clearLayers();

      data.map_data.forEach((kab: any) => {
        if (kab.koordinat_lat && kab.koordinat_lng) {
          const status = kab.status_risiko.toLowerCase();
          let color = '#10B981'; // Aman
          if (status === 'kritis' || status === 'defisit') color = '#B91C1C';
          else if (status === 'waspada') color = '#D97706';

          const markerHtml = `
            <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></div>
          `;
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: markerHtml,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });

          L.marker([parseFloat(kab.koordinat_lat), parseFloat(kab.koordinat_lng)], { icon })
           .addTo(markerLayerRef.current)
           .bindPopup(`<b>${kab.nama_kabupaten}</b><br/>Status: ${kab.status_risiko}`)
           .on('click', () => {
              setActiveFocusArea(kab);
           });
        }
      });
    }

  }, [data]);

  const handleRunAllGemini = async () => {
    if (!data || !data.map_data) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    setIsAiLoading(true);
    let successCount = 0;
    const total = data.map_data.length;
    setAiProgress('Mengambil data cuaca BMKG Real-time...');

    // Ambil data BMKG (menggunakan proxy AllOrigins untuk bypass CORS di Frontend)
    let bmkgXml: Document | null = null;
    try {
      const bmkgUrl = encodeURIComponent('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SulawesiSelatan.xml');
      const bmkgRes = await fetch(`https://api.allorigins.win/raw?url=${bmkgUrl}`);
      if (bmkgRes.ok) {
         const xmlText = await bmkgRes.text();
         bmkgXml = new window.DOMParser().parseFromString(xmlText, "text/xml");
      }
    } catch (e) {
      console.warn("Gagal fetch BMKG, menggunakan fallback cuaca normal.");
    }

    // Ambil semua data alokasi untuk dianalisis
    const { data: allData, error: dbError } = await supabase.from('data_alokasi_pupuk').select(`*, master_kabupaten(nama_kabupaten)`);
    if (dbError || !allData) {
       alert('Gagal mengambil data alokasi untuk dianalisis.');
       setIsAiLoading(false);
       return;
    }

    const totalToAnalyze = allData.length;

    for (let i = 0; i < totalToAnalyze; i++) {
      const kab = allData[i];
      const namaKab = kab.master_kabupaten?.nama_kabupaten || 'Wilayah Tidak Diketahui';
      setAiProgress(`Menganalisis (${i + 1}/${totalToAnalyze}): ${namaKab}...`);
      
      try {
        let aiResult: any = null;

        let cuacaSaatIni = "Cerah / Berawan";
        let targetUrea = Number(kab.kuota_urea);
        let targetNpk = Number(kab.kuota_npk);
        let targetStatus = "Aman";

        if (bmkgXml) {
           const cleanKabName = kab.nama_kabupaten.replace('Kabupaten ', '').replace('Kota ', '');
           const areas = bmkgXml.querySelectorAll('area');
           for (let j = 0; j < areas.length; j++) {
              const area = areas[j];
              const desc = area.getAttribute('description');
              if (desc && desc.toLowerCase().includes(cleanKabName.toLowerCase())) {
                 const weatherParam = Array.from(area.querySelectorAll('parameter')).find(p => p.getAttribute('id') === 'weather');
                 if (weatherParam) {
                     const firstVal = weatherParam.querySelector('timerange value')?.textContent;
                     if (['60', '61', '62', '63', '95', '97'].includes(firstVal || '')) {
                        cuacaSaatIni = "Hujan Lebat / Ekstrem Terdeteksi (Potensi La Niña)";
                        targetUrea = Math.floor(targetUrea * 1.25);
                        targetNpk = Math.floor(targetNpk * 1.25);
                        targetStatus = "Kritis";
                     } else if (['4', '5'].includes(firstVal || '')) {
                        cuacaSaatIni = "Hujan Sedang / Berawan Tebal";
                        targetUrea = Math.floor(targetUrea * 1.10);
                        targetNpk = Math.floor(targetNpk * 1.10);
                        targetStatus = "Waspada";
                     } else if (firstVal === '0') {
                        cuacaSaatIni = "Cerah Terik";
                     } else if (['1', '2'].includes(firstVal || '')) {
                        cuacaSaatIni = "Cerah Berawan";
                     } else if (firstVal === '3') {
                        cuacaSaatIni = "Berawan";
                     }
                 }
                 break;
              }
           }
        }

        // NATIVE API CALL - Cukup minta AI merangkai kata berdasarkan fakta matematis kita!
        const isNaik = targetUrea > kab.kuota_urea;
        const promptText = `Sebagai AgriVision AI (Sistem Command Center Pertanian), tolong buatkan narasi rekomendasi untuk alokasi pupuk di ${namaKab}.
Fakta saat ini:
- Komoditas: ${kab.komoditas}
- Kondisi Cuaca BMKG: ${cuacaSaatIni}
- Status Risiko Sistem: ${targetStatus}
- Prediksi Urea Baru: ${targetUrea} Ton ${isNaik ? `(Naik dari ${kab.kuota_urea} Ton)` : '(Sama dengan kuota)'}
- Prediksi NPK Baru: ${targetNpk} Ton ${isNaik ? `(Naik dari ${kab.kuota_npk} Ton)` : '(Sama dengan kuota)'}

Tugas Anda: Buat 1 atau 2 kalimat narasi rekomendasi eksekutif dan profesional (menggunakan bahasa Indonesia yang baik) menjelaskan MENGAPA statusnya ${targetStatus} dan mengapa kuota pupuk disesuaikan atau dipertahankan. Jangan menyebutkan ulang angka pastinya, cukup sebutkan implikasi cuaca ${cuacaSaatIni} terhadap serapan hara tanaman.

Kembalikan respon DALAM FORMAT JSON murni (tanpa markdown markdown) dengan struktur berikut:
{
  "prediksi_urea": ${targetUrea},
  "prediksi_npk": ${targetNpk},
  "status_risiko": "${targetStatus}",
  "narasi_rekomendasi": (Ketik narasi Anda di sini)
}`;

        const payload = {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        };

        let res: Response | null = null;
        try {
            res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error("API Gemini menolak request atau Rate Limit.");
            const resData = await res.json();
            let aiText = resData.candidates[0].content.parts[0].text;
            
            // Bersihkan formatting markdown JSON dari Gemini
            aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
            aiResult = JSON.parse(aiText);
        } catch (apiErr) {
            console.warn("Gemini API Error/Rate Limit, menggunakan Fallback Simulasi Lokal untuk: " + kab.nama_kabupaten);
            // Fallback aman jika API Limit / Gagal
            const actionText = targetStatus === "Aman" ? "dipertahankan" : "ditingkatkan";
            aiResult = {
                prediksi_urea: targetUrea,
                prediksi_npk: targetNpk,
                status_risiko: targetStatus,
                narasi_rekomendasi: `Berdasarkan pantauan cuaca BMKG (${cuacaSaatIni}), alokasi pupuk perlu ${actionText} untuk menjaga efektivitas serapan hara tanaman.`
            };
        }

        // Simpan Hasil ke Supabase
        if (aiResult) {
            const { error: updateError } = await supabase
                .from('data_alokasi_pupuk')
                .update({
                    prediksi_urea: aiResult.prediksi_urea,
                    prediksi_npk: aiResult.prediksi_npk,
                    status_risiko: aiResult.status_risiko,
                    narasi_rekomendasi: aiResult.narasi_rekomendasi,
                    cuaca_anomali: cuacaSaatIni,
                    last_analyzed_at: new Date().toISOString()
                })
                .eq('id_alokasi', kab.id_alokasi);
            
            if (!updateError) successCount++;
        }
      } catch (err) {
        console.error("Gagal menganalisis " + kab.nama_kabupaten, err);
      }
    }

    // Refresh data (tidak wajib karena ada Realtime, tapi untuk jaga-jaga)
    await fetchDashboardData();
    setIsAiLoading(false);
    setAiProgress('');
    alert(`Analisis Gemini AI selesai untuk ${successCount} dari ${total} wilayah! Peta telah diperbarui.`);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">Memuat data Dashboard...</div>;
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

  const { totals, kritis_data, user } = data;
  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans relative">
      <Navbar onNavigate={onNavigate} onLogout={onLogout} activePage="dashboard" />

      {/* Filter / Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 h-auto min-h-[48px] py-2 md:py-0 md:h-[60px] flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[10px] md:text-[11px] font-bold tracking-widest text-gray-400 gap-1 md:gap-2 uppercase flex-wrap">
          <span className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</span>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors hidden sm:inline">PUSAT KOMANDO ANALITIK</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-gray-900">{user?.is_provinsi_admin ? 'SULAWESI SELATAN' : user?.nama_kabupaten || 'KABUPATEN'}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-auto lg:overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 md:gap-6 lg:shrink-0 lg:overflow-y-auto pb-2 lg:pb-4 custom-scrollbar">
          
          {/* Ringkasan Alokasi */}
          <div className="bg-white rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 p-5 md:p-6">
            <h2 className="text-[12px] md:text-[13px] font-bold text-gray-500 tracking-wider uppercase mb-4 md:mb-6">Ringkasan Alokasi</h2>
            
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] md:text-[28px] lg:text-[32px] font-extrabold text-[#113224] tracking-tighter leading-none">{formatNumber(totals.lahan)}</span>
                  <span className="text-xs md:text-sm font-bold text-[#113224]">Ha</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 tracking-wider mt-1 md:mt-2">TOTAL LUAS LAHAN</div>
              </div>

              <div className="lg:border-t lg:border-gray-100 lg:pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] md:text-[28px] lg:text-[32px] font-extrabold text-[#006B4D] tracking-tighter leading-none">{formatNumber(totals.urea)}</span>
                  <span className="text-xs md:text-sm font-bold text-[#006B4D]">Ton</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 tracking-wider mt-1 md:mt-2">TOTAL KUOTA UREA</div>
              </div>

              <div className="lg:border-t lg:border-gray-100 lg:pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] md:text-[28px] lg:text-[32px] font-extrabold text-[#006B4D] tracking-tighter leading-none">{formatNumber(totals.npk)}</span>
                  <span className="text-xs md:text-sm font-bold text-[#006B4D]">Ton</span>
                </div>
                <div className="text-[10px] font-bold text-gray-500 tracking-wider mt-1 md:mt-2">TOTAL KUOTA NPK</div>
              </div>
            </div>
          </div>

          {/* Wilayah Kritis */}
          <div className="bg-[#FCFDFD] rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <div className="px-4 md:px-5 py-3 md:py-3.5 border-b border-red-100 flex items-center justify-between bg-red-50/40 rounded-t-md">
              <div className="flex items-center gap-2 text-[#B91C1C]">
                <AlertTriangle size={16} strokeWidth={2.5} />
                <h2 className="text-[12px] md:text-[13px] font-extrabold tracking-widest uppercase">Wilayah Kritis</h2>
              </div>
              <span className="bg-red-200 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">LIVE</span>
            </div>

            <div className="p-4 md:p-5 flex flex-col gap-4 md:gap-6">
              {kritis_data.length > 0 ? kritis_data.map((row: any, idx: number) => {
                const status = row.status_risiko.toLowerCase();
                const isKritis = status === 'kritis' || status === 'defisit';
                const bgClass = isKritis ? 'bg-[#B91C1C]' : 'bg-[#D97706]';
                const textClass = isKritis ? 'text-[#B91C1C]' : 'text-[#D97706]';
                const Icon = isKritis ? TrendingDown : Clock;

                return (
                  <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-[15px] text-gray-900">{row.nama_kabupaten}</h3>
                      <span className={`${bgClass} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none`}>
                        {row.status_risiko}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed mb-3 pr-2">
                      {row.narasi_rekomendasi || 'Prediksi AI menunjukkan indikasi defisit pupuk. Segera lakukan penyesuaian alokasi atau koordinasi antar wilayah.'}
                    </p>
                    <div className={`flex items-center gap-1.5 ${textClass} text-[12px] font-bold`}>
                      <Icon size={14} strokeWidth={2.5} />
                      <span>
                        {row.prediksi_urea > row.kuota_urea 
                          ? `Defisit Urea ${formatNumber(row.prediksi_urea - row.kuota_urea)} Ton`
                          : 'Kondisi Stabil'
                        }
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-[13px] text-gray-500 italic text-center py-4">Semua wilayah dalam kondisi aman.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 min-w-0 lg:overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-linear-to-r from-[#1E3B33] to-[#254A41] rounded-md px-5 md:px-8 py-5 md:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shadow-sm shrink-0 relative overflow-hidden gap-4 sm:gap-0">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
             
            <div className="relative z-10">
              <h1 className="text-[17px] md:text-[20px] lg:text-[22px] font-extrabold tracking-tight mb-1 md:mb-2">Status Ketahanan Pupuk: {user?.is_provinsi_admin ? 'Sulawesi Selatan' : user?.nama_kabupaten || 'Kabupaten'}</h1>
              <p className="text-white/80 text-[12px] md:text-[14px] font-medium">Analisis prediktif berbasis data cuaca dan realisasi e-RDKK bulan ini.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 relative z-10 flex-wrap">
              <div className="flex items-center gap-2 text-white/90 text-[11px] md:text-[12px] bg-white/10 px-2.5 py-1.5 rounded border border-white/20">
                <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></div>
                AI Auto-Sync Aktif
              </div>
              <button 
                onClick={handleRunAllGemini}
                disabled={isAiLoading}
                className="bg-[#34D399] hover:bg-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed text-[#022C22] font-bold px-3 md:px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm text-[11px] md:text-[12px] tracking-wide"
              >
                <Sparkles size={13} className="text-[#022C22] fill-[#022C22]" />
                {isAiLoading ? (aiProgress || 'Menganalisis...') : 'Jalankan Gemini AI'}
              </button>
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 rounded-md border border-gray-200 relative overflow-hidden min-h-[300px] md:min-h-[400px]">
            {/* The actual leaflet map container */}
            <div ref={mapContainer} className="absolute inset-0 z-0"></div>

            {/* Overlay Info Panel */}
            {activeFocusArea && (
              <div className="absolute top-3 left-3 md:top-6 md:left-6 w-[260px] md:w-[300px] bg-white rounded-md shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col z-10 border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                  <h3 className="font-extrabold text-[15px] text-[#113224] uppercase leading-snug w-3/4 tracking-tight">
                    Fokus Area: {activeFocusArea.nama_kabupaten}
                  </h3>
                  <div className={`${(activeFocusArea.status_risiko.toLowerCase() === 'kritis' || activeFocusArea.status_risiko.toLowerCase() === 'defisit') ? 'bg-[#B91C1C]' : 'bg-[#D97706]'} text-white text-[10px] font-bold px-2 py-1 rounded text-center leading-tight tracking-wider shrink-0 uppercase`}>
                    STATUS:<br/>{activeFocusArea.status_risiko}
                  </div>
                </div>

                <div className="p-5 flex flex-col">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Luas Lahan</div>
                      <div className="font-bold text-[#113224] text-[14px]">{formatNumber(activeFocusArea.luas_lahan || 0)} Ha</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuaca Saat Ini</div>
                      <div className="font-bold text-[#006B4D] text-[12px] leading-tight">{activeFocusArea.cuaca_anomali || 'Menunggu analisis...'}</div>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Prediksi Kebutuhan AI
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-[28px] font-extrabold text-[#113224] tracking-tight leading-none">{formatNumber(activeFocusArea.prediksi_urea || 0)}</span>
                    <span className="text-[14px] font-bold text-gray-500">Ton</span>
                  </div>

                  <button 
                    onClick={() => {
                      onNavigate('county_detail', activeFocusArea.id_kabupaten);
                    }}
                    className="w-full py-2.5 border border-[#006B4D] text-[#006B4D] font-bold text-[13px] rounded hover:bg-[#006B4D] hover:text-white transition-colors tracking-wide"
                  >
                    LIHAT DETAIL WILAYAH
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
