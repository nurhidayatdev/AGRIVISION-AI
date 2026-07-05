import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { FileText, Send, MapPin, AlertCircle, CheckCircle2, Leaf, Droplets, Bug } from 'lucide-react';
import logo from '../assets/logo_agrivision_ai.png';

interface PplReportProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export default function PplReport({ onLogout, onNavigate }: PplReportProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [kondisiLahan, setKondisiLahan] = useState('Normal');
  const [usulanUrea, setUsulanUrea] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const sessionStr = localStorage.getItem('agrivision_session');
    if (sessionStr) {
      const user = JSON.parse(sessionStr);
      setCurrentUser(user);
      fetchMyReports(user.id_user);
    } else {
      onLogout();
    }
  }, [onLogout]);

  const fetchMyReports = async (userId: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('laporan_ppl')
        .select('*')
        .eq('id_user', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        id_user: currentUser.id_user,
        id_kabupaten: currentUser.id_kabupaten,
        nama_kecamatan: currentUser.nama_kecamatan || 'Tidak Diketahui',
        kondisi_lahan: kondisiLahan,
        usulan_tambahan_urea: usulanUrea ? parseFloat(usulanUrea) : 0,
        catatan_lapangan: catatan
      };

      const { error } = await supabase.from('laporan_ppl').insert([payload]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Laporan lapangan berhasil dikirim!' });
      setKondisiLahan('Normal');
      setUsulanUrea('');
      setCatatan('');
      fetchMyReports(currentUser.id_user);
      
      // Auto hide success message
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal mengirim laporan: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header Khusus PPL */}
      <nav className="bg-[#023E2D] text-white shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center justify-between px-4 md:px-6 h-[64px]">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-[16px] tracking-wide">AGRIVISION AI <span className="font-medium text-white/70 ml-2 hidden sm:inline">| Portal PPL</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-bold">{currentUser?.nama_lengkap}</div>
              <div className="text-[11px] text-[#0FE193] font-medium">{currentUser?.nama_kecamatan || 'WKPP Belum Diset'}</div>
            </div>
            <button onClick={onLogout} className="text-sm font-medium hover:text-[#0FE193] transition-colors border border-white/20 px-3 py-1.5 rounded-md bg-white/5">Keluar</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Form Input */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="bg-[#006B4D] px-5 py-4 text-white">
              <h2 className="font-bold text-[16px] flex items-center gap-2">
                <FileText size={18} />
                Buat Laporan Baru
              </h2>
              <p className="text-white/80 text-[12px] mt-1 flex items-center gap-1">
                <MapPin size={12} />
                Kecamatan: <span className="font-semibold">{currentUser?.nama_kecamatan || '-'}</span>
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              {message.text && (
                <div className={`p-3 rounded-md text-[13px] font-medium flex items-start gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">Kondisi Lahan Aktual</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setKondisiLahan('Normal')} className={`px-3 py-2 text-[12px] font-medium rounded-md border flex items-center justify-center gap-1.5 transition-all ${kondisiLahan === 'Normal' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Leaf size={14} /> Normal
                  </button>
                  <button type="button" onClick={() => setKondisiLahan('Kekeringan')} className={`px-3 py-2 text-[12px] font-medium rounded-md border flex items-center justify-center gap-1.5 transition-all ${kondisiLahan === 'Kekeringan' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Droplets size={14} className="opacity-60" /> Kekeringan
                  </button>
                  <button type="button" onClick={() => setKondisiLahan('Banjir')} className={`px-3 py-2 text-[12px] font-medium rounded-md border flex items-center justify-center gap-1.5 transition-all ${kondisiLahan === 'Banjir' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Droplets size={14} /> Banjir
                  </button>
                  <button type="button" onClick={() => setKondisiLahan('Serangan Hama')} className={`px-3 py-2 text-[12px] font-medium rounded-md border flex items-center justify-center gap-1.5 transition-all ${kondisiLahan === 'Serangan Hama' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Bug size={14} /> Hama
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">Usulan Tambahan Pupuk Urea (Ton)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.1"
                  value={usulanUrea} 
                  onChange={e => setUsulanUrea(e.target.value)} 
                  placeholder="Misal: 5.5" 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]"
                />
                <p className="text-[11px] text-gray-500">Kosongkan jika tidak ada permintaan mendesak.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#113224]">Catatan & Observasi Lapangan</label>
                <textarea 
                  rows={4}
                  required
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Ceritakan detail kondisi lahan secara singkat..." 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !currentUser?.nama_kecamatan}
                className={`w-full py-3 rounded-md font-bold text-[13px] flex items-center justify-center gap-2 transition-colors mt-2 ${isSubmitting || !currentUser?.nama_kecamatan ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#006B4D] hover:bg-[#00573E] text-white shadow-md'}`}
              >
                {isSubmitting ? 'Mengirim...' : (
                  <>
                    <Send size={16} />
                    Kirim Laporan
                  </>
                )}
              </button>
              
              {!currentUser?.nama_kecamatan && (
                <p className="text-[11px] text-red-500 text-center font-medium">Anda belum di-assign ke Kecamatan manapun. Hubungi Admin.</p>
              )}
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Laporan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-[#113224] tracking-tight">Riwayat Laporan Anda</h2>
              <span className="text-[12px] bg-[#006B4D]/10 text-[#006B4D] font-bold px-2.5 py-1 rounded-full">{reports.length} Laporan</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#006B4D]/20 border-t-[#006B4D] rounded-full animate-spin"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400">
                  <FileText size={48} className="mb-3 opacity-20" />
                  <p className="font-medium text-[14px] text-gray-500">Belum ada laporan</p>
                  <p className="text-[12px] mt-1">Laporan yang Anda kirim akan muncul di sini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id_laporan} className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              report.kondisi_lahan === 'Kekeringan' ? 'bg-orange-100 text-orange-700' :
                              report.kondisi_lahan === 'Banjir' ? 'bg-blue-100 text-blue-700' :
                              report.kondisi_lahan === 'Serangan Hama' ? 'bg-red-100 text-red-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {report.kondisi_lahan}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h3 className="font-bold text-[#113224] text-[14px]">Kecamatan {report.nama_kecamatan}</h3>
                        </div>
                        {report.usulan_tambahan_urea > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Usulan</div>
                            <div className="font-extrabold text-[#006B4D] text-[15px]">+{report.usulan_tambahan_urea} Ton</div>
                          </div>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
                        "{report.catatan_lapangan}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
