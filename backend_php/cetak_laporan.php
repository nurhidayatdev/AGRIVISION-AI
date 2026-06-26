<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// Fetch Master Kabupaten for the dropdown
$stmt_kab = $pdo->query("SELECT id, nama_kabupaten FROM master_kabupaten ORDER BY nama_kabupaten ASC");
$kabupatens = $stmt_kab->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Laporan - AgriVision AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
    </style>
</head>
<body class="min-h-screen bg-[#F5F7F5] flex flex-col font-sans">
    
    <!-- Top Navbar -->
    <nav class="bg-[#023E2D] text-white flex items-center justify-between pl-6 pr-4 h-[64px] shrink-0">
        <!-- Left: Logo & Nav -->
        <div class="flex items-center h-full">
            <!-- Logo -->
            <div class="flex items-center mr-10 gap-3">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z" fill="#006B4D" stroke="#0FE193" stroke-width="1"/>
                  <ellipse cx="12" cy="12" rx="2" ry="5.5" fill="#0FE193"/>
                </svg>
                <span class="font-extrabold text-[17px] tracking-wide">AGRIVISION AI</span>
            </div>

            <!-- Nav Links -->
            <div class="flex items-center h-full text-[15px] font-medium ml-4">
                <a href="dashboard.php" class="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Dashboard</a>
                <a href="kelola_data.php" class="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Data</a>
                <a href="cetak_laporan.php" class="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Cetak Laporan</a>
                <a href="users.php" class="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Pengguna</a>
            </div>
        </div>

        <!-- Right: User Info -->
        <div class="flex items-center gap-6 h-full">
            <span class="text-[13px] text-white/90 font-medium"><?= date('l, d F Y') ?></span>
            <a href="riwayat_notifikasi.php" class="relative text-white/90 hover:text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
            </a>
            
            <div class="flex items-center gap-3 border-l border-white/20 pl-6 py-2">
                <div class="text-right">
                    <div class="text-[14px] font-bold leading-tight"><?= htmlspecialchars($_SESSION['nama_lengkap'] ?? 'User') ?></div>
                    <div class="text-[12px] text-white/70 font-medium"><?= htmlspecialchars($_SESSION['role'] ?? 'Role') ?></div>
                </div>
                <a href="logout.php" 
                  class="w-10 h-10 rounded-md bg-[#006B4D] flex items-center justify-center border border-white/10 hover:bg-[#00573E] cursor-pointer transition-colors group relative"
                  title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white group-hover:hidden"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white hidden group-hover:block"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </a>
            </div>
        </div>
    </nav>

    <!-- Breadcrumb Bar -->
    <div class="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div class="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
            <a href="dashboard.php" class="hover:text-gray-700 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </a>
            <span>/</span>
            <span class="hover:text-gray-700 cursor-pointer transition-colors">Pelaporan</span>
            <span>/</span>
            <span class="text-gray-900">Generator Eksekutif PDF</span>
        </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-6 flex gap-6 overflow-hidden">
        
        <!-- Left Panel: Parameter Laporan -->
        <div class="w-[340px] bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            <form action="proses_cetak_pdf.php" method="GET" target="_blank" class="flex flex-col h-full">
                <div class="p-6 border-b border-gray-100 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[#006B4D]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <h2 class="text-[18px] font-extrabold text-[#113224]">Parameter Laporan</h2>
                </div>
                
                <div class="p-6 flex flex-col gap-6 flex-1">
                    <!-- Periode -->
                    <div class="space-y-2">
                        <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode Pelaporan</label>
                        <div class="relative">
                            <select name="musim_tanam" class="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                                <option value="Musim Kemarau 2026">Musim Kemarau 2026</option>
                                <option value="Musim Hujan 2026">Musim Hujan 2026</option>
                                <option value="Semua">Semua Musim</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                        </div>
                    </div>

                    <!-- Wilayah -->
                    <div class="space-y-2">
                        <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cakupan Wilayah</label>
                        <div class="relative">
                            <select name="id_kabupaten" class="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                                <option value="">Nasional - Seluruh Provinsi</option>
                                <?php foreach($kabupatens as $kab): ?>
                                    <option value="<?= $kab['id'] ?>"><?= htmlspecialchars($kab['nama_kabupaten']) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                        </div>
                    </div>

                    <div class="h-[1px] bg-gray-100 w-full my-2"></div>

                    <!-- Komoditas -->
                    <div class="space-y-3">
                        <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pilih Komoditas Pupuk</label>
                        <div class="flex gap-6">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <div class="w-4 h-4 bg-[#006B4D] rounded flex items-center justify-center">
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span class="text-[13px] text-gray-700 font-medium">Urea</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <div class="w-4 h-4 bg-[#006B4D] rounded flex items-center justify-center">
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <span class="text-[13px] text-gray-700 font-medium">NPK</span>
                            </label>
                        </div>
                    </div>

                    <!-- Toggle Gemini AI -->
                    <div class="border border-gray-200 rounded-md p-4 mt-2">
                        <div class="flex items-start justify-between mb-2 relative">
                            <div class="flex items-center gap-2">
                                <div class="bg-[#006B4D] text-white p-1 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                </div>
                                <span class="font-extrabold text-[13px] text-[#113224]">Sertakan Analisis Naratif<br/>Gemini AI</span>
                            </div>
                            <!-- Toggle Switch (Visual Only with hidden checkbox logic) -->
                            <label class="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" name="sertakan_ai" value="true" class="sr-only peer" checked>
                                <div class="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006B4D]"></div>
                            </label>
                        </div>
                        <p class="text-[13px] text-gray-500 leading-relaxed pr-4 mt-3">
                            Generasi otomatis ringkasan eksekutif dan rekomendasi kebijakan berdasarkan data spasial.
                        </p>
                    </div>
                    
                    <div class="flex-1"></div>

                    <!-- Warning Box -->
                    <div class="bg-[#D1FAE5] rounded-md p-4 flex gap-3 text-[#065F46]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                        <p class="text-[12px] font-medium leading-relaxed">
                            Dokumen ini akan disahkan dengan Digital e-Sign BSSN. Pastikan parameter yang dipilih telah sesuai sebelum eksekusi.
                        </p>
                    </div>

                    <!-- Generate Button -->
                    <button type="submit" class="w-full bg-[#113224] hover:bg-[#022C22] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[13px] tracking-widest shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                        GENERATE LAPORAN PDF
                    </button>
                </div>
            </form>
        </div>

        <!-- Right Panel: AI Monitor -->
        <div class="flex-1 bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col min-w-0 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-700"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
                    <h2 class="text-[18px] font-extrabold text-[#113224]">AI Processing Monitor</h2>
                </div>
                <div class="bg-[#ECFDF5] border border-[#10B981] text-[#059669] px-3 py-1.5 rounded-sm flex items-center gap-2 text-[11px] font-bold tracking-widest">
                    <div class="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                    STANDBY
                </div>
            </div>

            <div class="flex-1 p-8 flex flex-col justify-center max-w-[800px] mx-auto w-full">
                <!-- Loading Status Area -->
                <div class="flex flex-col items-center justify-center mb-10 text-center">
                    <div class="w-16 h-16 rounded-xl border-4 border-gray-200 flex items-center justify-center mb-6 relative">
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                    <h3 class="text-[20px] font-extrabold text-[#113224] mb-2 tracking-tight">Siap Melakukan Generate</h3>
                    <p class="text-[14px] text-gray-500">Pilih parameter di sebelah kiri dan klik Generate Laporan PDF.</p>
                </div>

                <!-- Progress Bar -->
                <div class="w-full mb-8 opacity-30">
                    <div class="flex justify-between text-[11px] font-bold text-gray-500 mb-2 tracking-widest uppercase">
                        <span>Progress</span>
                        <span>0%</span>
                    </div>
                    <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-[#006B4D] rounded-full w-[0%] relative overflow-hidden">
                        </div>
                    </div>
                </div>

                <!-- Terminal Window -->
                <div class="w-full bg-[#042f2e] rounded-md overflow-hidden shadow-lg border border-[#134e4a] flex flex-col h-[280px]">
                    <!-- Terminal Header -->
                    <div class="bg-[#022c22] px-4 py-2.5 border-b border-[#134e4a] flex items-center shrink-0">
                        <div class="flex gap-2">
                            <div class="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                            <div class="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                            <div class="w-3 h-3 rounded-full bg-[#10B981]"></div>
                        </div>
                        <div class="ml-4 text-[#4ade80]/60 text-[10px] font-mono tracking-widest uppercase">
                            Secure Kernel Log : PID 8492
                        </div>
                    </div>
                    
                    <!-- Terminal Body -->
                    <div class="p-5 font-mono text-[12px] leading-relaxed overflow-y-auto custom-scrollbar flex-1 text-[#a7f3d0]">
                        <div class="flex gap-4 mb-2 opacity-50">
                            <span class="text-[#4ade80]/50 shrink-0"><?= date('H:i:s') ?></span>
                            <span><span className="text-white font-bold">[INFO]</span> Menunggu instruksi...</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </main>
</body>
</html>
