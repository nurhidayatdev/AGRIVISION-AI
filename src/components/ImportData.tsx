import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Trash2,
  Sparkles,
  Lock,
  Loader2
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ImportData() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = 'http://localhost/AGRIVISION-AI/backend_php/api_proses_import.php';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      // 1. Ambil data master_kabupaten dari Supabase
      const { data: masterData, error: masterError } = await supabase
        .from('master_kabupaten')
        .select('id_kabupaten, nama_kabupaten, kode_bps');
      
      if (masterError) throw new Error("Gagal mengambil data master kabupaten dari Supabase");

      const kabMap = new Map();
      masterData?.forEach(item => {
        const normalized = item.nama_kabupaten.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
        kabMap.set(normalized, item.id_kabupaten);
      });

      // 2. Baca semua file CSV yang diunggah
      const fileContents: string[] = [];
      for (const file of files) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
        fileContents.push(`\n--- ISI FILE: ${file.name} ---\n${text}`);
      }

      // 3. Gabungkan menjadi prompt untuk Gemini
      const combinedCsvData = fileContents.join('\n');
      const prompt = `Anda adalah sistem AI perencana alokasi pupuk bersubsidi (AGRIVISION-AI).
Saya memiliki data BPS (Luas Panen, Produktivitas, Produksi) dan usulan e-RDKK (Urea, NPK) untuk berbagai kabupaten di Sulawesi Selatan.
Data mentah ada di bawah ini dalam format CSV.
Tugas Anda:
1. Rekonsiliasi data ini per Kabupaten/Kota.
2. Prediksi jumlah pupuk optimal (Urea dan NPK) dengan MENGANALISIS secara komprehensif: luas panen, angka produktivitas, dan total produksi dari BPS, serta asumsikan pengaruh cuaca terkini dan sentimen laporan PPL di lapangan.
3. Tentukan 'status_risiko' (pilih salah satu: 'Aman', 'Waspada', 'Kritis') berdasarkan perbandingan usulan e-RDKK dengan luasan lahan dan produktivitas.
4. Buat 'narasi_rekomendasi' maksimal 2 kalimat (bahasa Indonesia formal) yang merekomendasikan alokasi dengan menyinggung faktor cuaca/produktivitas.
5. Output HARUS dalam format JSON array berisi objek dengan properti persis seperti berikut (tanpa blok markdown json):

{
  "nama_kabupaten": "Nama Kabupaten/Kota sesuai data",
  "tahun": (Tahun dari data eRDKK CSV, misal 2023, 2024, atau 2025),
  "musim_tanam": "MT I",
  "komoditas": "Padi",
  "luas_lahan": (angka desimal luas, jangan gunakan string),
  "kuota_urea": (angka usulan urea dari data eRDKK),
  "kuota_npk": (angka usulan npk dari data eRDKK),
  "prediksi_urea": (angka prediksi Anda),
  "prediksi_npk": (angka prediksi Anda),
  "status_risiko": "Aman" | "Waspada" | "Kritis",
  "narasi_rekomendasi": "string"
}

Data CSV Mentah:
${combinedCsvData}
`;

      // 4. Kirim ke Gemini API
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Gemini (VITE_GEMINI_API_KEY) tidak ditemukan di file .env");

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      const geminiData = await geminiResponse.json();
      if (!geminiResponse.ok) {
        throw new Error(geminiData.error?.message || "Gagal menghubungi API Gemini");
      }

      const resultText = geminiData.candidates[0].content.parts[0].text;
      const parsedData = JSON.parse(resultText);
      const dataToInsert: Record<string, string | number>[] = [];

      // 5. Petakan nama_kabupaten ke id_kabupaten dan siapkan payload
      for (const item of parsedData) {
        const normalizedItemName = item.nama_kabupaten.toLowerCase().replace('kabupaten', '').replace('kota', '').trim();
        const idKabupaten = kabMap.get(normalizedItemName);

        if (idKabupaten) {
          dataToInsert.push({
            id_kabupaten: idKabupaten,
            tahun: item.tahun || 2024,
            musim_tanam: item.musim_tanam || 'MT I',
            komoditas: item.komoditas || 'Padi',
            luas_lahan: item.luas_lahan,
            kuota_urea: item.kuota_urea,
            kuota_npk: item.kuota_npk,
            prediksi_urea: item.prediksi_urea,
            prediksi_npk: item.prediksi_npk,
            status_risiko: item.status_risiko,
            narasi_rekomendasi: item.narasi_rekomendasi,
            cuaca_anomali: 'Cuaca Normal (Default)',
            last_analyzed_at: new Date().toISOString()
          });
        }
      }

      // 6. Simpan ke Supabase
      if (dataToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('data_alokasi_pupuk')
          .insert(dataToInsert);
        
        if (insertError) throw new Error(`Gagal menyimpan ke Supabase: ${insertError.message}`);
      }

      setIsUploading(false);
      setUploadMessage(`Sukses! ${dataToInsert.length} data alokasi telah diproses oleh AI dan berhasil disimpan ke Supabase.`);
      setShowModal(true);
      setFiles([]);

    } catch (error: unknown) {
      console.error(error);
      setIsUploading(false);
      setUploadMessage(`TERJADI KESALAHAN:\n${error instanceof Error ? error.message : String(error)}`);
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 h-[48px] flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
          <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</button>
          <span>/</span>
          <button onClick={() => navigate('/kelola_data')} className="hover:text-gray-700 cursor-pointer transition-colors hidden sm:inline">MANAJEMEN DATA</button>
          <span className="hidden sm:inline">/</span>
          <span className="text-gray-900">IMPORT BERKAS INTEGRASI</span>
        </div>
        
        <button 
          onClick={() => navigate('/kelola_data')}
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

          <div className="h-px w-full bg-gray-100 mb-8"></div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx,.csv" 
            onChange={handleFileChange} 
            multiple
          />

          {/* Drag & Drop Zone */}
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
            <p className="text-[14px] text-gray-500 mb-5">atau klik untuk menelusuri dari perangkat (Bisa pilih banyak file sekaligus)</p>
            <div className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1.5 rounded tracking-widest uppercase">
              MENDUKUNG: .XLSX, .CSV (MAX 50MB)
            </div>
          </div>

          {/* Uploaded File State */}
          {files.length > 0 && (
            <div className="mb-8 space-y-3">
              {files.map((f, index) => (
                <div key={index} className="bg-[#F8FAFC] border border-gray-200 rounded-md p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-[#10B981]">
                      <CheckCircle2 size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#113224]">{f.name}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5">{(f.size / (1024 * 1024)).toFixed(2)} MB • Siap diproses</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="text-[#DC2626] hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50" disabled={isUploading}>
                    <Trash2 size={20} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="w-full bg-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#059669] text-white font-bold py-4 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] tracking-wider mb-8 shadow-sm"
          >
            {isUploading ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Sparkles size={18} strokeWidth={2} />}
            {isUploading ? 'SEDANG MENGEKSTRAK...' : `MULAI EKSTRAKSI AI (${files.length} FILE)`}
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Lock size={14} strokeWidth={2} />
            <span className="text-[12px] font-medium">Protokol Enkripsi End-to-End GovTech Klasifikasi Terbatas</span>
          </div>

        </div>
      </main>

      {/* Modal Popup Success */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#D1DFD9] text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-extrabold text-[#113224] mb-2">Proses Selesai!</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                {uploadMessage}
              </p>
              
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-[#113224] hover:bg-[#0A2017] text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-md tracking-wider text-sm"
              >
                TUTUP & KEMBALI
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
