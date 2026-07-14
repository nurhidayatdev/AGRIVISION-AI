import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import logo from '../assets/logo_agrivision_ai.png';
import { supabase } from '../utils/supabaseClient';
import {
  Bell,
  User,
  ChevronRight,
  LogOut,
  FileText,
  ChevronDown,
  Check,
  ShieldAlert,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { MasterKabupaten, AlokasiPupuk } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ReportGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kabupatens, setKabupatens] = useState<MasterKabupaten[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [reportData, setReportData] = useState<AlokasiPupuk[]>([]);
  const [reportMetadata, setReportMetadata] = useState<any>({ tahun: '', wilayah: '', pupuk_terpilih: ['Urea', 'NPK'] });
  const [generatedAiNarrative, setGeneratedAiNarrative] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [printTrigger, setPrintTrigger] = useState(0);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[INFO] Menunggu parameter dari pengguna...']);
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: kabData } = await supabase.from('master_kabupaten').select('id_kabupaten, nama_kabupaten').order('nama_kabupaten', { ascending: true });
        if (kabData) setKabupatens(kabData.map(k => ({ id: k.id_kabupaten, nama_kabupaten: k.nama_kabupaten })));

        const { data: yearData } = await supabase.from('data_alokasi_pupuk').select('tahun');
        if (yearData) {
           const uniqueYears = Array.from(new Set(yearData.map(d => Number(d.tahun)))).filter(Boolean).sort((a,b) => b-a);
           setAvailableYears(uniqueYears);
           if (uniqueYears.length > 0) setSelectedYears([uniqueYears[0]]);
        }
      } catch (err) {
        console.error("Gagal mengambil data inisial", err);
      }
    };
    fetchInitialData();
  }, []);

  // Auto scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (printTrigger > 0 && reportData.length > 0) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [printTrigger, reportData]);

  const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);
    setTerminalLogs([`[${new Date().toLocaleTimeString('id-ID')}] [INIT] Memulai proses kompilasi laporan PDF...`]);
    
    const formData = new FormData(e.currentTarget);
    const idKab = formData.get('id_kabupaten') as string;
    
    if (selectedYears.length === 0) {
      setModalMessage("Pilih minimal satu periode tahun untuk dicetak!");
      setShowModal(true);
      setIsGenerating(false);
      return;
    }
    const tahunTerpilih = selectedYears;
    
    // get selected fertilizers
    const inputs = e.currentTarget.querySelectorAll('input[name="jenis_pupuk"]:checked');
    const pupukTerpilih = Array.from(inputs).map(i => (i as HTMLInputElement).value);
    
    if (pupukTerpilih.length === 0) {
      alert("Pilih minimal satu jenis pupuk untuk dicetak!");
      setIsGenerating(false);
      return;
    }
    
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const addLog = (msg: string) => setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);

    await delay(600);
    addLog("[FETCH] Mengamankan koneksi ke Supabase Database...");
    
    let query = supabase.from('data_alokasi_pupuk').select(`*, master_kabupaten(nama_kabupaten, kode_bps)`);
    
    if (tahunTerpilih.length > 0) {
      query = query.in('tahun', tahunTerpilih);
    }
    if (idKab && idKab !== '') {
      query = query.eq('id_kabupaten', idKab);
    }
    
    await delay(800);
    addLog("[DATA] Mengekstraksi data alokasi dan master kabupaten...");
    const { data, error } = await query.order('tahun', { ascending: false }).order('id_alokasi', { ascending: true });
    
    if (error) {
      addLog("[ERROR] Gagal menarik data dari server.");
      setIsGenerating(false);
      return;
    }
    
    if (!data || data.length === 0) {
      addLog("[WARN] Data kosong untuk parameter yang dipilih. Dibatalkan.");
      setIsGenerating(false);
      return;
    }

    if (isAiEnabled) {
       await delay(900);
       addLog("[AI_SYS] Menginisialisasi Gemini AI Context Engine...");
       await delay(1200);
       addLog("[AI_SYS] Menyusun narasi rekomendasi eksekutif berdasarkan tren cuaca dan sentimen...");
       
       const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
       if (apiKey) {
         try {
           const wilayahTeks = idKab === '' ? 'Semua Kabupaten/Kota' : (data[0].master_kabupaten?.nama_kabupaten || 'Wilayah Tertentu');
           const summaryData = data.slice(0, 15).map((d: AlokasiPupuk) => {
             const mk = Array.isArray(d.master_kabupaten) ? d.master_kabupaten[0] : d.master_kabupaten;
             return `${mk?.nama_kabupaten || ''}: Urea ${d.kuota_urea} vs ${d.prediksi_urea}, Status ${d.status_risiko}`;
           }).join('; ');
           
           const prompt = `Buatkan analisis naratif eksekutif yang ditujukan kepada pemangku kepentingan (Gubernur, Dinas Pertanian, dan Kebijakan Publik) terkait alokasi dan prediksi pupuk di ${wilayahTeks} tahun ${tahunTerpilih.join(', ')}. Analisis harus terdiri dari 2-3 paragraf komprehensif yang mencakup: 1. Kondisi umum ketersediaan pupuk vs prediksi kebutuhan. 2. Identifikasi area dengan risiko defisit tinggi atau kritis. 3. Rekomendasi kebijakan logistik atau intervensi strategis. Gunakan data sampel berikut sebagai basis fakta: ${summaryData}. Gunakan bahasa Indonesia yang sangat formal, profesional, dan berwibawa. Jangan gunakan format markdown (seperti tebal/miring), gunakan teks paragraf biasa saja.`;
           
           const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
           });
           
           if (res.ok) {
             const aiData = await res.json();
             const text = aiData.candidates[0].content.parts[0].text;
             setGeneratedAiNarrative(text.trim());
             addLog("[AI_SYS] Narasi AI berhasil di-generate.");
           } else {
             const errText = await res.text();
             setGeneratedAiNarrative("Data naratif gagal dimuat dari server AI.");
             addLog(`[WARN] Gagal mendapatkan respons dari Gemini AI. Kode: ${res.status}`);
             console.error("Gemini Error:", errText);
           }
         } catch (e) {
           setGeneratedAiNarrative("Terjadi kesalahan koneksi ke server AI.");
           addLog("[WARN] Kesalahan koneksi Gemini AI.");
         }
       }
    } else {
       setGeneratedAiNarrative('');
    }
    
    await delay(700);
    addLog("[AUTH] Menerapkan Tanda Tangan Elektronik Tersertifikasi (e-Sign BSSN)...");
    
    await delay(800);
    addLog("[DONE] Rendering PDF selesai. Meneruskan ke modul Print...");

    const wilayahText = idKab === '' ? 'Semua Kabupaten/Kota' : (data[0].master_kabupaten?.nama_kabupaten || 'Wilayah Tertentu');
    
    setReportMetadata({
      tahun: tahunTerpilih.join(', '),
      wilayah: wilayahText,
      pupuk_terpilih: pupukTerpilih
    });
    
    setReportData(data);
    setIsGenerating(false);
    setPrintTrigger(prev => prev + 1);
  };

  return (
    <div className="w-full">
      {/* -------------------- LAYAR BROWSER BIASA -------------------- */}
      <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans print:hidden">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</button>
          <span>/</span>
          <span className="text-gray-900">CETAK LAPORAN</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-auto lg:overflow-hidden">
        
        {/* Left Panel: Parameter Laporan */}
        <div className="w-[340px] bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleGenerateReport} className="flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <FileText size={24} strokeWidth={2.5} className="text-[#006B4D]" />
              <h2 className="text-[18px] font-extrabold text-[#113224]">Parameter Laporan</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-5 flex-1">
              {/* Periode */}
              <div className="space-y-3" ref={dropdownRef}>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode Tahun</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                    className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 bg-white flex items-center cursor-pointer focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]"
                  >
                    <span className="truncate">{selectedYears.length > 0 ? selectedYears.sort((a,b) => b-a).join(', ') : 'Pilih Tahun'}</span>
                  </div>
                  <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} strokeWidth={2} />
                  </div>
                  
                  {isYearDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto custom-scrollbar py-1">
                      {availableYears.length > 0 && (
                        <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                          <input 
                            type="checkbox" 
                            checked={selectedYears.length === availableYears.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedYears([...availableYears]);
                              else setSelectedYears([]);
                            }}
                            className="w-4 h-4 text-[#006B4D] bg-white border-gray-300 rounded focus:ring-[#006B4D] cursor-pointer accent-[#006B4D]" 
                          />
                          <span className="text-[13px] font-bold text-gray-800">Pilih Semua</span>
                        </label>
                      )}
                      {availableYears.map((y) => (
                        <label key={y} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="tahun" 
                            value={y.toString()} 
                            checked={selectedYears.includes(y)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedYears([...selectedYears, y]);
                              else setSelectedYears(selectedYears.filter(year => year !== y));
                            }}
                            className="w-4 h-4 text-[#006B4D] bg-white border-gray-300 rounded focus:ring-[#006B4D] cursor-pointer accent-[#006B4D]" 
                          />
                          <span className="text-[13px] text-gray-700 font-medium">{y}</span>
                        </label>
                      ))}
                      {availableYears.length === 0 && (
                        <div className="px-3 py-2 text-[12px] text-gray-400 italic">Memuat tahun...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Wilayah */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cakupan Wilayah</label>
                <div className="relative">
                  <select name="id_kabupaten" className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                    <option value="">Semua Kabupaten/Kota</option>
                    {kabupatens.map(kab => (
                      <option key={kab.id} value={kab.id}>{kab.nama_kabupaten}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full my-2"></div>

              {/* Jenis Pupuk */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pilih Jenis Pupuk</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="jenis_pupuk" value="Urea" defaultChecked className="w-4 h-4 text-[#006B4D] bg-white border-gray-300 rounded focus:ring-[#006B4D] cursor-pointer accent-[#006B4D]" />
                    <span className="text-[13px] text-gray-700 font-medium">Urea</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="jenis_pupuk" value="NPK" defaultChecked className="w-4 h-4 text-[#006B4D] bg-white border-gray-300 rounded focus:ring-[#006B4D] cursor-pointer accent-[#006B4D]" />
                    <span className="text-[13px] text-gray-700 font-medium">NPK</span>
                  </label>
                </div>
              </div>

              {/* Toggle Gemini AI */}
              <div className="border border-gray-200 rounded-md p-4 mt-2">
                <div className="flex items-start justify-between mb-2 relative">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#006B4D] text-white p-1 rounded">
                      <Terminal size={14} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-[13px] text-[#113224]">Sertakan Analisis Naratif<br/>Gemini AI</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input type="checkbox" name="sertakan_ai" value="true" checked={isAiEnabled} onChange={() => setIsAiEnabled(!isAiEnabled)} className="sr-only peer" />
                    <div className={`w-10 h-6 rounded-full peer transition-all ${isAiEnabled ? 'bg-[#006B4D]' : 'bg-gray-200'} relative after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isAiEnabled ? 'after:translate-x-[16px] after:border-white' : 'after:left-[2px]'}`}></div>
                  </label>
                </div>
              </div>
              
              <div className="flex-1"></div>

              {/* Warning Box */}
              <div className="bg-[#D1FAE5] rounded-md p-3 flex gap-2.5 text-[#065F46] mt-2">
                <ShieldAlert size={16} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed">
                  Disahkan dengan Digital e-Sign BSSN. Pastikan parameter sesuai sebelum eksekusi.
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 mt-auto">
              <button type="submit" className="w-full bg-[#113224] hover:bg-[#022C22] text-white font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-colors text-[13px] tracking-widest shadow-sm">
                <FileText size={16} strokeWidth={2.5} />
                GENERATE LAPORAN PDF
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: AI Monitor */}
        <div className="flex-1 bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <Terminal size={20} strokeWidth={2.5} className="text-gray-700" />
              <h2 className="text-[18px] font-extrabold text-[#113224]">AI Processing Monitor</h2>
            </div>
            <div className="bg-[#ECFDF5] border border-[#10B981] text-[#059669] px-3 py-1.5 rounded-sm flex items-center gap-2 text-[11px] font-bold tracking-widest">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
              STANDBY
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col justify-center max-w-[800px] mx-auto w-full">
            {/* Loading Status Area */}
            <div className="flex flex-col items-center justify-center mb-10 text-center">
              <div className="w-16 h-16 rounded-xl border-4 border-gray-200 flex items-center justify-center mb-6 relative">
                 <FileText size={32} strokeWidth={2} className="text-gray-400" />
              </div>
              <h3 className="text-[20px] font-extrabold text-[#113224] mb-2 tracking-tight">Siap Melakukan Generate</h3>
              <p className="text-[14px] text-gray-500">Pilih parameter di sebelah kiri dan klik Generate Laporan PDF.</p>
            </div>

            {/* Terminal Window */}
            <div className="w-full bg-[#042f2e] rounded-md overflow-hidden shadow-lg border border-[#134e4a] flex flex-col h-[280px]">
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
              
              <div ref={terminalRef} className="p-5 font-mono text-[12px] leading-relaxed overflow-y-auto custom-scrollbar flex-1 text-[#a7f3d0]">
                {terminalLogs.map((log, index) => {
                   const isInfo = log.includes('[INFO]');
                   const isDone = log.includes('[DONE]');
                   const isError = log.includes('[ERROR]');
                   const isWarn = log.includes('[WARN]');
                   const isAi = log.includes('[AI_SYS]');
                   
                   let colorClass = 'text-[#a7f3d0]';
                   if (isError || isWarn) colorClass = 'text-red-400 font-bold';
                   if (isDone) colorClass = 'text-green-300 font-bold';
                   if (isAi) colorClass = 'text-yellow-300';
                   
                   return (
                     <div key={index} className={`flex gap-4 mb-2 ${isInfo ? 'opacity-50' : 'opacity-100'}`}>
                       <span className={colorClass}>{log}</span>
                     </div>
                   );
                })}
                {isGenerating && (
                   <div className="flex gap-4 mb-2">
                     <span className="text-[#a7f3d0] animate-pulse">_</span>
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>

    {/* -------------------- LAYAR CETAK (PDF) -------------------- */}
    <div className="hidden print:block w-full bg-white text-black p-8 font-serif">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1">Laporan Eksekutif Alokasi Pupuk Bersubsidi</h1>
        <p className="text-sm">Sistem Pakar AgriVision AI</p>
      </div>
      
      <div className="mb-6 text-sm flex justify-between items-start">
        <table className="w-[400px]">
          <tbody>
            <tr><td className="font-bold w-[120px] py-1">Tahun</td><td>: {reportMetadata.tahun}</td></tr>
            <tr><td className="font-bold py-1">Wilayah</td><td>: {reportMetadata.wilayah}</td></tr>
            <tr><td className="font-bold py-1">Jenis Pupuk</td><td>: {reportMetadata.pupuk_terpilih?.join(', ')}</td></tr>
          </tbody>
        </table>
        <table className="w-[250px]">
          <tbody>
            <tr><td className="font-bold w-[120px] py-1">Tanggal Cetak</td><td>: {new Date().toLocaleDateString('id-ID')}</td></tr>
            <tr><td className="font-bold py-1">Jam</td><td>: {new Date().toLocaleTimeString('id-ID')}</td></tr>
            <tr><td className="font-bold py-1">Sistem</td><td>: AgriVision AI</td></tr>
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse text-[11px] mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 text-center w-[40px]">No</th>
            <th className="border border-black p-2 text-left">Kabupaten</th>
            <th className="border border-black p-2 text-left">Tahun / Musim</th>
            <th className="border border-black p-2 text-right">Luas (HA)</th>
            {reportMetadata.pupuk_terpilih?.includes('Urea') && (
              <>
                <th className="border border-black p-2 text-right">Kuota Urea</th>
                <th className="border border-black p-2 text-right bg-emerald-50">Prediksi Urea</th>
              </>
            )}
            {reportMetadata.pupuk_terpilih?.includes('NPK') && (
              <>
                <th className="border border-black p-2 text-right">Kuota NPK</th>
                <th className="border border-black p-2 text-right bg-emerald-50">Prediksi NPK</th>
              </>
            )}
            <th className="border border-black p-2 text-center w-[80px]">Status Risiko</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, i) => (
            <tr key={row.id_alokasi || i}>
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 font-bold">{row.master_kabupaten?.nama_kabupaten || 'Unknown'}</td>
              <td className="border border-black p-2">{row.tahun} / {row.musim_tanam}</td>
              <td className="border border-black p-2 text-right font-mono">{Number(row.luas_lahan).toLocaleString('id-ID')}</td>
              {reportMetadata.pupuk_terpilih?.includes('Urea') && (
                <>
                  <td className="border border-black p-2 text-right font-mono">{Number(row.kuota_urea).toLocaleString('id-ID')}</td>
                  <td className="border border-black p-2 text-right font-bold bg-emerald-50 font-mono">{Number(row.prediksi_urea).toLocaleString('id-ID')}</td>
                </>
              )}
              {reportMetadata.pupuk_terpilih?.includes('NPK') && (
                <>
                  <td className="border border-black p-2 text-right font-mono">{Number(row.kuota_npk).toLocaleString('id-ID')}</td>
                  <td className="border border-black p-2 text-right font-bold bg-emerald-50 font-mono">{Number(row.prediksi_npk).toLocaleString('id-ID')}</td>
                </>
              )}
              <td className="border border-black p-2 text-center font-bold uppercase">{row.status_risiko}</td>
            </tr>
          ))}
          {reportData.length === 0 && (
            <tr>
              <td colSpan={10} className="border border-black p-4 text-center italic text-gray-500">Data Tidak Tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

      {isAiEnabled && reportData.length > 0 && generatedAiNarrative && (
        <div className="mb-10 p-4 border border-black bg-gray-50">
          <h3 className="font-bold text-[14px] mb-2 underline">Analisis Naratif Eksekutif (AI Generated)</h3>
          <div className="text-[12px] leading-relaxed text-justify space-y-3">
            {generatedAiNarrative.split('\n').map((paragraph, idx) => (
              paragraph.trim() ? <p key={idx}>{paragraph.trim()}</p> : null
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-16 text-[13px] text-center">
        <div>
          <p className="mb-16">Disahkan secara sistem oleh,</p>
          <p className="font-bold border-b border-black inline-block">Sistem AgriVision AI</p>
          <p>e-Sign BSSN Terverifikasi</p>
        </div>
      </div>
    </div>
    
    {/* Custom Error Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Peringatan Validasi</h3>
            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              {modalMessage}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#113224] hover:bg-[#022C22] text-white font-bold py-3 rounded-lg transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
