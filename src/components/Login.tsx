import React, { useState, useEffect } from 'react';
import { IdCard, Lock, Eye, Info } from 'lucide-react';
import logo from '../assets/logo_agrivision_ai.png';
import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabaseClient';

const getPasswordErrors = (pass: string) => {
  const errors = [];
  if (pass.length < 8) errors.push(`minimal 8 karakter (kurang ${8 - pass.length})`);
  if (!/[A-Z]/.test(pass)) errors.push('huruf besar');
  if (!/[a-z]/.test(pass)) errors.push('huruf kecil');
  if (!/[0-9]/.test(pass)) errors.push('angka');
  if (!/[!@#$%^&*?]/.test(pass)) errors.push('simbol (!@#$%^&*?)');
  return errors;
};

export default function Login({ onLogin }: { onLogin: (role: string) => void }) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPwdModal, setShowForgotPwdModal] = useState(false);

  // Load NIP dari localStorage jika ada
  useEffect(() => {
    const savedNip = localStorage.getItem('agrivision_saved_nip');
    if (savedNip) {
      setNip(savedNip);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasi NIP (18 digit angka)
    const nipRegex = /^\d{18}$/;
    if (!nipRegex.test(nip)) {
      setError('Otorisasi Ditolak: NIP harus terdiri dari persis 18 digit angka.');
      return;
    }

    // Validasi Kekuatan Password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Otorisasi Ditolak: Kata sandi tidak memenuhi standar keamanan. Harus minimal 8 karakter, mencakup huruf kapital, huruf kecil, angka, dan simbol khusus.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Cari user berdasarkan NIP di Supabase
      const { data: user, error: dbError } = await supabase
        .from('users')
        .select(`
          *,
          master_kabupaten (nama_kabupaten)
        `)
        .eq('nip', nip)
        .single();

      if (dbError || !user) {
        console.error("Supabase Error:", dbError);
        setError('Otorisasi Ditolak: NIP atau Kata Sandi yang Anda masukkan salah.');
        setIsLoading(false);
        return;
      }

      let isPasswordMatch = false;
      
      // Fallback jika password dari MySQL kosong (akibat error ekspor sebelumnya)
      if (!user.password_hash || user.password_hash === '') {
         // Bypass sementara untuk kemudahan testing prototype
         if (password === 'Admin123!') {
             isPasswordMatch = true;
             // Opsional: di aplikasi nyata, Anda sebaiknya meng-update password_hash di sini
         }
      } else {
         isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      }
      
      if (!isPasswordMatch) {
         setError('Otorisasi Ditolak: NIP atau Kata Sandi yang Anda masukkan salah.');
         setIsLoading(false);
         return;
      }

      // 3. Simpan data session ke localStorage
      const sessionData = {
          id_user: user.id_user,
          nip: user.nip,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          id_kabupaten: user.id_kabupaten,
          nama_kecamatan: user.nama_kecamatan,
          // Handle Supabase joining mapping
          nama_kabupaten: user.master_kabupaten ? (Array.isArray(user.master_kabupaten) ? user.master_kabupaten[0]?.nama_kabupaten : (user.master_kabupaten as any)?.nama_kabupaten) : null,
          is_provinsi_admin: user.role === 'Admin Provinsi'
      };
      localStorage.setItem('agrivision_session', JSON.stringify(sessionData));

      if (rememberMe) {
        localStorage.setItem('agrivision_saved_nip', nip);
      } else {
        localStorage.removeItem('agrivision_saved_nip');
      }
      
      onLogin(user.role);
    } catch (err) {
      console.error('Login error:', err);
      setError('Tidak dapat terhubung ke server Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center p-4 font-sans">
      {/* Main Login Card */}
      <div className="bg-white w-full max-w-[440px] rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <img src={logo} alt="AgriVision AI Logo" className="w-14 h-14 object-contain mb-2 drop-shadow-md" />
          </div>
          <h1 className="text-[22px] font-extrabold text-[#113224] tracking-wide mb-2">PORTAL AGRIVISION AI</h1>
          <p className="text-[#64748B] text-[15px] text-center leading-snug">
            Sistem Prediksi & Alokasi Pupuk<br />Terpadu Provinsi Sulawesi Selatan
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {/* NIP Input */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1E293B]">Nomor Induk Pegawai (NIP)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <IdCard size={20} strokeWidth={1.5} />
              </div>
              <input
                type="text"
                placeholder="Masukkan NIP Anda"
                value={nip}
                onChange={(e) => setNip(e.target.value.replace(/\D/g, ''))}
                required
                className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-[15px] focus:outline-none focus:ring-1 text-gray-700 placeholder-gray-400 ${nip.length > 0 && !/^\d{18}$/.test(nip) ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#006B4D] focus:ring-[#006B4D]'}`}
              />
            </div>
            {nip.length > 0 && !/^\d{18}$/.test(nip) && (
              <p className="text-[12px] text-red-500 mt-1 font-medium">
                {nip.length < 18 ? `Kurang ${18 - nip.length} digit angka lagi.` : `Kelebihan ${nip.length - 18} digit angka.`}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1E293B]">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock size={20} strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-10 py-2.5 border rounded-md text-[15px] focus:outline-none focus:ring-1 tracking-widest text-gray-700 placeholder-gray-400 ${password.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password) ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#006B4D] focus:ring-[#006B4D]'}`}
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#94A3B8] hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Eye size={20} strokeWidth={1.5} />
              </div>
            </div>
            {password.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/.test(password) && (
              <p className="text-[12px] text-red-500 mt-1 font-medium leading-tight">
                Kurang: {getPasswordErrors(password).join(', ')}.
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-gray-300 rounded text-[#006B4D] focus:ring-[#006B4D] accent-[#006B4D]" 
              />
              <span className="text-[14px] text-[#475569]">Ingat Sesi Saya</span>
            </label>
            <button type="button" onClick={() => setShowForgotPwdModal(true)} className="text-[14px] text-[#006B4D] hover:underline font-medium">Lupa Sandi?</button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !/^\d{18}$/.test(nip) || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/.test(password)}
            className={`w-full font-bold text-[14px] py-3 rounded-md transition-colors mt-2 tracking-wide 
              ${isLoading || !/^\d{18}$/.test(nip) || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/.test(password) 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#006B4D] hover:bg-[#00573E] text-white'}`}
          >
            {isLoading ? 'MEMPROSES...' : 'OTORISASI MASUK'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-start justify-center text-[#94A3B8] space-x-1.5">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p className="text-[13px] text-center max-w-[250px] leading-relaxed">
              Akses terbatas khusus staf Dinas Pertanian dan PPL
            </p>
          </div>
        </div>
      </div>

      {/* Modal Lupa Sandi */}
      {showForgotPwdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md max-w-sm w-full p-6 text-center shadow-xl">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Lupa Kata Sandi?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Jika Anda melupakan kata sandi, silakan hubungi <b>Administrator Provinsi</b> atau <b>IT Support Dinas Pertanian</b> untuk melakukan reset kata sandi Anda secara manual.
            </p>
            <button
              onClick={() => setShowForgotPwdModal(false)}
              className="w-full bg-[#006B4D] text-white font-bold py-2 px-4 rounded hover:bg-[#00573E] transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
