import { useState, useRef } from 'react';
import logo from '../assets/logo_agrivision_ai.png';
import {
  Bell,
  User,
  LogOut,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Trash2,
  Sparkles,
  Lock,
  Loader2
} from 'lucide-react';

export default function ImportData({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = 'http://localhost/AGRIVISION-AI/backend_php/api_proses_import.php';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    // Simulasi loading sebelum menampilkan pesan bahwa n8n mengambil alih
    setTimeout(() => {
        setIsUploading(false);
        alert("Integrasi berhasil! Karena Anda kini menggunakan arsitektur Supabase, file ini sebaiknya dikirim ke Webhook n8n untuk diproses oleh AI secara background, lalu hasilnya di-insert otomatis ke tabel Supabase 'data_alokasi_pupuk'.\n\n(Untuk demo: fitur upload ditangani secara terpisah oleh n8n).");
        setFile(null);
    }, 2000);
  };

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
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <span className="hover:text-gray-700 cursor-pointer transition-colors" onClick={() => onNavigate('dashboard')}>BERANDA</span>
          <span>/</span>
          <span className="hover:text-gray-700 cursor-pointer transition-colors" onClick={() => onNavigate('kelola_data')}>MANAJEMEN DATA</span>
          <span>/</span>
          <span className="text-gray-900">IMPORT BERKAS INTEGRASI</span>
        </div>
        
        <button 
          onClick={() => onNavigate('kelola_data')}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Kembali
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-[700px] bg-white rounded-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-10">
          
          <h1 className="text-[24px] font-extrabold text-[#113224] tracking-tight mb-2">Unggah Dokumen e-RDKK & BPS</h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
            Sistem Gemini AI akan secara otomatis mengekstrak, memvalidasi, dan merekonsiliasi data alokasi pupuk bersubsidi dengan basis data spasial BPS.
          </p>

          <div className="h-[1px] w-full bg-gray-100 mb-8"></div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx,.csv" 
            onChange={handleFileChange} 
          />

          {/* Drag & Drop Zone */}
          {!file && (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-md bg-[#F8FAFC] py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors mb-6 group"
            >
              <div className="w-16 h-16 bg-[#D1DFD9] rounded flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileText size={32} className="text-[#023E2D]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-extrabold text-[#113224] mb-2 tracking-wide">Tarik & Lepas File di Sini</h3>
              <p className="text-[14px] text-gray-500 mb-5">atau klik untuk menelusuri dari perangkat</p>
              <div className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1.5 rounded tracking-widest uppercase">
                MENDUKUNG: .XLSX, .CSV (MAX 50MB)
              </div>
            </div>
          )}

          {/* Uploaded File State */}
          {file && (
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-md p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="text-[#10B981]">
                  <CheckCircle2 size={24} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#113224]">{file.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB • Siap diproses</div>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-[#DC2626] hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50" disabled={isUploading}>
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#059669] text-white font-bold py-4 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] tracking-wider mb-8 shadow-sm"
          >
            {isUploading ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Sparkles size={18} strokeWidth={2} />}
            {isUploading ? 'SEDANG MENGEKSTRAK...' : 'MULAI EKSTRAKSI AI'}
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock size={14} strokeWidth={2} />
            <span className="text-[12px] font-medium">Protokol Enkripsi End-to-End GovTech Klasifikasi Terbatas</span>
          </div>

        </div>
      </main>
    </div>
  );
}
