import { useState, useEffect } from 'react';
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
  Terminal
} from 'lucide-react';

export default function ReportGenerator({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
  const [kabupatens, setKabupatens] = useState<any[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportMetadata, setReportMetadata] = useState<any>({ musim: '', wilayah: '', komoditas: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [printTrigger, setPrintTrigger] = useState(0);

  useEffect(() => {
    const fetchKabupaten = async () => {
      try {
        const { data, error } = await supabase
          .from('master_kabupaten')
          .select('id_kabupaten, nama_kabupaten')
          .order('nama_kabupaten', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setKabupatens(data.map(k => ({ id: k.id_kabupaten, nama_kabupaten: k.nama_kabupaten })));
        }
      } catch (err) {
        console.error("Gagal mengambil data kabupaten dari Supabase", err);
      }
    };
    fetchKabupaten();
  }, []);

  useEffect(() => {
    if (printTrigger > 0 && reportData.length > 0) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [printTrigger, reportData]);

  const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    
    const formData = new FormData(e.currentTarget);
    const musim = formData.get('musim_tanam') as string;
    const idKab = formData.get('id_kabupaten') as string;
    
    // get all checked commodities
    const inputs = e.currentTarget.querySelectorAll('input[name="komoditas"]:checked');
    const komoditas = Array.from(inputs).map(i => (i as HTMLInputElement).value);
    
    let query = supabase.from('data_alokasi_pupuk').select(`*, master_kabupaten(nama_kabupaten, kode_bps)`);
    
    if (musim && musim !== 'Semua') {
      query = query.eq('musim_tanam', musim);
    }
    if (idKab && idKab !== '') {
      query = query.eq('id_kabupaten', idKab);
    }
    if (komoditas.length > 0) {
      query = query.in('komoditas', komoditas);
    }
    
    const { data, error } = await query.order('id_alokasi', { ascending: true });
    
    if (error) {
      console.error(error);
      alert("Gagal menarik data untuk cetak");
      setIsGenerating(false);
      return;
    }
    
    if (!data || data.length === 0) {
      alert("Data kosong untuk parameter yang dipilih.");
      setIsGenerating(false);
      return;
    }

    const wilayahText = idKab === '' ? 'Nasional - Seluruh Provinsi' : (data[0].master_kabupaten?.nama_kabupaten || 'Wilayah Tertentu');
    
    setReportMetadata({
      musim: musim === 'Semua' ? 'Semua Musim' : musim,
      wilayah: wilayahText,
      komoditas: komoditas.length > 0 ? komoditas.join(', ') : 'Semua Komoditas'
    });
    
    setReportData(data);
    setIsGenerating(false);
    setPrintTrigger(prev => prev + 1);
  };

  return (
    <div className="w-full">
      {/* -------------------- LAYAR BROWSER BIASA -------------------- */}
      <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans print:hidden">
      <Navbar onNavigate={onNavigate} onLogout={onLogout} activePage="cetak_laporan" />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-gray-700 transition-colors flex items-center">
            <ChevronRight size={14} strokeWidth={2.5} className="rotate-180" />
          </button>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors">PELAPORAN</span>
          <span>/</span>
          <span className="text-gray-900">GENERATOR EKSEKUTIF PDF</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Left Panel: Parameter Laporan */}
        <div className="w-[340px] bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleGenerateReport} className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <FileText size={24} strokeWidth={2.5} className="text-[#006B4D]" />
              <h2 className="text-[18px] font-extrabold text-[#113224]">Parameter Laporan</h2>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1">
              {/* Periode */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode Pelaporan</label>
                <div className="relative">
                  <select name="musim_tanam" className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                    <option value="Musim Kemarau 2026">Musim Kemarau 2026</option>
                    <option value="Musim Hujan 2026">Musim Hujan 2026</option>
                    <option value="Semua">Semua Musim</option>
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
                  <select name="id_kabupaten" className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                    <option value="">Nasional - Seluruh Provinsi</option>
                    {kabupatens.map(kab => (
                      <option key={kab.id} value={kab.id}>{kab.nama_kabupaten}</option>
                    ))}
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
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] text-gray-700 font-medium">Urea</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 bg-[#006B4D] rounded flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
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
                <p className="text-[13px] text-gray-500 leading-relaxed pr-4 mt-3">
                  Generasi otomatis ringkasan eksekutif dan rekomendasi kebijakan berdasarkan data spasial.
                </p>
              </div>
              
              <div className="flex-1"></div>

              {/* Warning Box */}
              <div className="bg-[#D1FAE5] rounded-md p-4 flex gap-3 text-[#065F46]">
                <ShieldAlert size={18} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                <p className="text-[12px] font-medium leading-relaxed">
                  Dokumen ini akan disahkan dengan Digital e-Sign BSSN. Pastikan parameter yang dipilih telah sesuai sebelum eksekusi.
                </p>
              </div>

              {/* Generate Button */}
              <button type="submit" className="w-full bg-[#113224] hover:bg-[#022C22] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[13px] tracking-widest shadow-sm">
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
              
              <div className="p-5 font-mono text-[12px] leading-relaxed overflow-y-auto custom-scrollbar flex-1 text-[#a7f3d0]">
                <div className="flex gap-4 mb-2 opacity-50">
                  <span className="text-[#4ade80]/50 shrink-0">10:00:00</span>
                  <span><span className="text-white font-bold">[INFO]</span> Menunggu instruksi...</span>
                </div>
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
            <tr><td className="font-bold w-[120px] py-1">Periode</td><td>: {reportMetadata.musim}</td></tr>
            <tr><td className="font-bold py-1">Wilayah</td><td>: {reportMetadata.wilayah}</td></tr>
            <tr><td className="font-bold py-1">Komoditas</td><td>: {reportMetadata.komoditas}</td></tr>
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
            <th className="border border-black p-2 text-left">Musim Tanam</th>
            <th className="border border-black p-2 text-left">Komoditas</th>
            <th className="border border-black p-2 text-right">Luas (HA)</th>
            <th className="border border-black p-2 text-right">Kuota Urea</th>
            <th className="border border-black p-2 text-right bg-emerald-50">Prediksi Urea</th>
            <th className="border border-black p-2 text-right">Kuota NPK</th>
            <th className="border border-black p-2 text-right bg-emerald-50">Prediksi NPK</th>
            <th className="border border-black p-2 text-center w-[80px]">Status Risiko</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, i) => (
            <tr key={row.id_alokasi || i}>
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 font-bold">{row.master_kabupaten?.nama_kabupaten || 'Unknown'}</td>
              <td className="border border-black p-2">{row.musim_tanam}</td>
              <td className="border border-black p-2">{row.komoditas}</td>
              <td className="border border-black p-2 text-right font-mono">{Number(row.luas_lahan).toLocaleString('id-ID')}</td>
              <td className="border border-black p-2 text-right font-mono">{Number(row.kuota_urea).toLocaleString('id-ID')}</td>
              <td className="border border-black p-2 text-right font-bold bg-emerald-50 font-mono">{Number(row.prediksi_urea).toLocaleString('id-ID')}</td>
              <td className="border border-black p-2 text-right font-mono">{Number(row.kuota_npk).toLocaleString('id-ID')}</td>
              <td className="border border-black p-2 text-right font-bold bg-emerald-50 font-mono">{Number(row.prediksi_npk).toLocaleString('id-ID')}</td>
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

      {isAiEnabled && reportData.length > 0 && (
        <div className="mb-10 p-4 border border-black bg-gray-50">
          <h3 className="font-bold text-[14px] mb-2 underline">Analisis Naratif Eksekutif (AI Generated)</h3>
          <p className="text-[12px] leading-relaxed text-justify mb-2">
            Berdasarkan data perhitungan algoritma model AgriVision AI, 
            kondisi {reportMetadata.musim} untuk {reportMetadata.wilayah} menunjukkan adanya 
            dinamika cuaca yang mempengaruhi tingkat penyerapan pupuk. 
          </p>
          <p className="text-[12px] leading-relaxed text-justify">
            Disarankan untuk melakukan realokasi dan penyesuaian logistik sesuai dengan nilai "Prediksi" yang tertera di atas untuk menghindari defisit ketersediaan pupuk bagi petani. Status risiko tertinggi saat ini memerlukan intervensi langsung dari dinas terkait.
          </p>
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
  </div>
  );
}
