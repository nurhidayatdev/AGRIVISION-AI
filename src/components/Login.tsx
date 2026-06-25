import { IdCard, Lock, Eye, Info } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center p-4 font-sans">
      {/* Main Login Card */}
      <div className="bg-white w-full max-w-[440px] rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z" fill="#024D36"/>
              <ellipse cx="12" cy="12" rx="3.5" ry="6.5" fill="#0FE193"/>
              <line x1="12" y1="7" x2="12" y2="17" stroke="#024D36" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-[22px] font-extrabold text-[#113224] tracking-wide mb-2">PORTAL AGRIVISION AI</h1>
          <p className="text-[#64748B] text-[15px] text-center leading-snug">
            Sistem Prediksi & Alokasi Pupuk<br />Terpadu Provinsi Sulawesi Selatan
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md text-[15px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1E293B]">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock size={20} strokeWidth={1.5} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-md text-[15px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400 tracking-widest"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#94A3B8] hover:text-gray-600">
                <Eye size={20} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-[#006B4D] focus:ring-[#006B4D] accent-[#006B4D]" />
              <span className="text-[14px] text-[#475569]">Ingat Sesi Saya</span>
            </label>
            <a href="#" className="text-[14px] text-[#006B4D] hover:underline font-medium">Lupa Sandi?</a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#006B4D] hover:bg-[#00573E] text-white font-bold text-[14px] py-3 rounded-md transition-colors mt-2 tracking-wide"
          >
            OTORISASI MASUK
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-start justify-center text-[#94A3B8] space-x-1.5">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-center max-w-[250px] leading-relaxed">
              Akses terbatas khusus staf Dinas Pertanian dan PPL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
