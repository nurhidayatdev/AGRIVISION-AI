<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

$id_kabupaten = isset($_GET['id_kabupaten']) ? intval($_GET['id_kabupaten']) : 0;

if ($id_kabupaten <= 0) {
    header("Location: dashboard.php");
    exit;
}

// Data Isolation Logic (RBAC)
$role = $_SESSION['role'] ?? '';
$is_provinsi_admin = in_array($role, ['Admin Provinsi', 'Admin Pusat', 'Kadis Provinsi']);

if (!$is_provinsi_admin) {
    if (isset($_SESSION['id_kabupaten']) && $_SESSION['id_kabupaten'] != $id_kabupaten) {
        header("Location: dashboard.php?error=unauthorized");
        exit;
    }
}

// Fetch detail from data_alokasi_pupuk & master_kabupaten
$sql = "SELECT dap.*, mk.nama_kabupaten, mk.kode_bps 
        FROM data_alokasi_pupuk dap
        JOIN master_kabupaten mk ON dap.id_kabupaten = mk.id
        WHERE dap.id_kabupaten = :id_kabupaten
        LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':id_kabupaten', $id_kabupaten, PDO::PARAM_INT);
$stmt->execute();
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    header("Location: dashboard.php?error=not_found");
    exit;
}

// Fetch history
$sql_history = "SELECT * FROM riwayat_peringatan WHERE id_kabupaten = :id_kabupaten ORDER BY tanggal DESC LIMIT 5";
$stmt_hist = $pdo->prepare($sql_history);
$stmt_hist->bindParam(':id_kabupaten', $id_kabupaten, PDO::PARAM_INT);
$stmt_hist->execute();
$history = $stmt_hist->fetchAll(PDO::FETCH_ASSOC);

$status_risiko = strtoupper($data['status_risiko'] ?? 'AMAN');
$status_bg = ($status_risiko == 'KRITIS' || $status_risiko == 'DEFISIT') ? 'bg-[#B91C1C]' : ($status_risiko == 'WASPADA' ? 'bg-[#D97706]' : 'bg-[#059669]');

$prediksi_urea = $data['prediksi_urea'] ?? 0;
$kuota_urea = $data['kuota_urea'] ?? 0;
$defisit = $prediksi_urea - $kuota_urea;
$is_defisit = $defisit > 0;
$defisit_pct = $kuota_urea > 0 ? ($defisit / $kuota_urea) * 100 : 0;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Kabupaten - AgriVision AI</title>
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
                <a href="kelola_data.php" class="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Kelola Data</a>
                <a href="cetak_laporan.php" class="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Cetak Laporan</a>
                <a href="users.php" class="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Pengguna</a>
            </div>
        </div>

        <!-- Right: User Info -->
        <div class="flex items-center gap-6 h-full">
            <span class="text-[13px] text-white/90 font-medium"><?= date('l, d F Y') ?></span>
            <button class="relative text-white/90 hover:text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
            </button>
            
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
    <div class="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center justify-between shrink-0 shadow-sm z-10">
        <div class="flex items-center text-[13px] font-medium text-gray-500 gap-2">
            <a href="kelola_data.php" class="mr-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </a>
            <a href="dashboard.php" class="hover:text-gray-900 cursor-pointer transition-colors">Beranda</a>
            <span class="text-gray-400">›</span>
            <a href="kelola_data.php" class="hover:text-gray-900 cursor-pointer transition-colors">Kelola Data</a>
            <span class="text-gray-400">›</span>
            <span class="text-[#113224] font-bold"><?= htmlspecialchars($data['nama_kabupaten']) ?></span>
        </div>
        <div class="flex items-center gap-5 text-[12px] font-bold text-gray-600">
            <a href="proses_cetak_pdf.php?musim_tanam=<?= urlencode($data['musim_tanam']) ?>&id_kabupaten=<?= $data['id_kabupaten'] ?>&sertakan_ai=true" class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Unduh
            </a>
            <a href="proses_cetak_pdf.php?musim_tanam=<?= urlencode($data['musim_tanam']) ?>&id_kabupaten=<?= $data['id_kabupaten'] ?>&sertakan_ai=true" target="_blank" class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Cetak
            </a>
        </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-6 flex gap-6 overflow-hidden">
        
        <!-- Left Column -->
        <div class="w-[320px] flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
            
            <!-- Main Info Card -->
            <div class="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                <div class="flex justify-between items-start mb-1">
                    <h1 class="text-[22px] font-extrabold text-[#113224] tracking-tight"><?= htmlspecialchars($data['nama_kabupaten']) ?></h1>
                    <span class="<?= $status_bg ?> text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none mt-1.5"><?= $status_risiko ?></span>
                </div>
                <p class="text-[13px] text-gray-500 mb-6">BPS Code: <?= htmlspecialchars($data['kode_bps'] ?? '-') ?></p>
                
                <div class="h-[1px] bg-gray-100 w-full mb-5"></div>
                
                <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Luas Tanam</div>
                <div class="flex items-baseline gap-1.5">
                    <span class="text-[20px] font-extrabold text-[#113224] tracking-tight"><?= number_format($data['luas_lahan'] ?? 0, 2, ',', '.') ?></span>
                    <span class="text-[14px] font-bold text-[#113224]">Ha</span>
                </div>
            </div>

            <!-- Quota vs Prediction Card -->
            <div class="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                 <div class="flex items-center gap-2 mb-2 text-[#006B4D]">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                     <span class="text-[11px] font-bold uppercase tracking-wider text-gray-700">Kuota Urea Saat Ini</span>
                 </div>
                 <div class="flex items-baseline gap-1.5 mb-6">
                     <span class="text-[32px] font-extrabold text-[#113224] leading-none tracking-tighter"><?= number_format($kuota_urea, 0, ',', '.') ?></span>
                     <span class="text-[12px] font-bold text-gray-500">Ton</span>
                 </div>

                 <div class="flex items-center gap-2 mb-2 text-[#006B4D]">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                     <span class="text-[11px] font-bold uppercase tracking-wider text-gray-700">Prediksi Kebutuhan AI</span>
                 </div>
                 <div class="flex items-baseline gap-1.5 mb-6">
                     <span class="text-[32px] font-extrabold text-[#113224] leading-none tracking-tighter"><?= number_format($prediksi_urea, 0, ',', '.') ?></span>
                     <span class="text-[12px] font-bold text-gray-500">Ton</span>
                 </div>

                 <?php if ($is_defisit): ?>
                 <div class="bg-red-50 border border-red-100 rounded p-4 flex flex-col gap-1.5 items-start">
                     <div class="flex items-center gap-1.5 text-[#DC2626]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                         <span class="text-[11px] font-bold uppercase tracking-wider">Status Pasokan</span>
                     </div>
                     <span class="text-[16px] font-extrabold text-[#DC2626] tracking-tight">Defisit <?= number_format($defisit, 0, ',', '.') ?> Ton (<?= number_format($defisit_pct, 1, ',', '.') ?>%)</span>
                 </div>
                 <?php else: ?>
                 <div class="bg-emerald-50 border border-emerald-100 rounded p-4 flex flex-col gap-1.5 items-start">
                     <div class="flex items-center gap-1.5 text-[#059669]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         <span class="text-[11px] font-bold uppercase tracking-wider">Status Pasokan</span>
                     </div>
                     <span class="text-[16px] font-extrabold text-[#059669] tracking-tight">Surplus/Aman</span>
                 </div>
                 <?php endif; ?>
            </div>

            <!-- Action Button -->
            <a href="proses_gemini.php?id_alokasi=<?= $data['id'] ?>" class="w-full bg-[#006B4D] hover:bg-[#00573E] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-colors text-[14px] shadow-sm tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Jalankan Gemini AI Ulang
            </a>

        </div>

        <!-- Right Column -->
        <div class="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pb-4 custom-scrollbar">
            
            <!-- Gemini AI Recommendation -->
            <div class="bg-[#ECFDF5] border border-[#A7F3D0] rounded-md p-6 relative overflow-hidden">
                <!-- Decorative Sparkles -->
                <div class="absolute top-2 right-4 opacity-50 pointer-events-none">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" fill="#A7F3D0"/>
                        <path d="M5 18L5.5 20.5L8 21L5.5 21.5L5 24L4.5 21.5L2 21L4.5 20.5L5 18Z" fill="#A7F3D0"/>
                        <path d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z" fill="#A7F3D0"/>
                    </svg>
                </div>
                
                <div class="flex items-center gap-2 mb-3 text-[#065F46] relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M3 5h4"></path><path d="M19 3v4"></path><path d="M17 5h4"></path><path d="M19 17v4"></path><path d="M17 19h4"></path></svg>
                    <h3 class="text-[16px] font-extrabold tracking-tight">Rekomendasi Gemini AI</h3>
                </div>
                <p class="text-[15px] text-[#065F46] leading-relaxed relative z-10 pr-12">
                    <?= nl2br(htmlspecialchars($data['narasi_rekomendasi'] ?? 'Belum ada rekomendasi yang di-generate. Silakan jalankan Gemini AI untuk menganalisis data wilayah ini.')) ?>
                </p>
                <?php if(!empty($data['cuaca_anomali'])): ?>
                <div class="mt-4 pt-4 border-t border-[#A7F3D0]/50 text-[13px] text-[#065F46] font-medium">
                    <span class="font-bold">Kondisi Cuaca (BMKG):</span> <?= htmlspecialchars($data['cuaca_anomali']) ?>
                </div>
                <?php endif; ?>
            </div>

            <!-- Bar Chart Mockup -->
            <div class="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
                <h3 class="text-[16px] font-extrabold text-[#113224] mb-8">Tren Kebutuhan Urea - 6 Bulan Terakhir</h3>
                
                <div class="h-[200px] flex flex-col justify-end gap-0 w-full relative">
                    <!-- Grid lines -->
                    <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div class="border-t border-gray-100 w-full border-dashed"></div>
                        <div class="border-t border-gray-100 w-full border-dashed"></div>
                        <div class="border-t border-gray-100 w-full border-dashed"></div>
                        <div class="border-t border-gray-200 w-full"></div>
                    </div>
                    
                    <div class="flex justify-around items-end h-[160px] relative z-10 px-8">
                         <!-- Mei -->
                         <div class="flex gap-1.5 items-end">
                             <div class="w-5 h-[90px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                             <div class="w-5 h-[95px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                         </div>
                         <!-- Jun -->
                         <div class="flex gap-1.5 items-end">
                             <div class="w-5 h-[85px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                             <div class="w-5 h-[88px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                         </div>
                         <!-- Jul -->
                         <div class="flex gap-1.5 items-end">
                             <div class="w-5 h-[105px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                             <div class="w-5 h-[115px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                         </div>
                         <!-- Ags -->
                         <div class="flex gap-1.5 items-end">
                             <div class="w-5 h-[100px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                             <div class="w-5 h-[110px] bg-[#006B4D] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                         </div>
                         <!-- Sep -->
                         <div class="flex gap-1.5 items-end">
                             <div class="w-5 h-[120px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                             <div class="w-5 h-[135px] bg-[#B91C1C] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                         </div>
                         <!-- Okt -->
                         <div class="flex gap-1.5 items-end">
                             <div class="w-5 h-[120px] bg-[#3f5d56] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                             <div class="w-5 h-[140px] bg-[#B91C1C] rounded-t-sm hover:opacity-80 transition-opacity"></div>
                         </div>
                    </div>

                    <div class="flex justify-around items-center px-8 mt-4 text-[12px] font-bold text-gray-700">
                         <span>Mei</span><span>Jun</span><span>Jul</span><span>Ags</span><span>Sep</span><span>Okt</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-center gap-8 mt-8">
                     <div class="flex items-center gap-2 text-[12px] font-bold text-[#113224]">
                         <div class="w-3.5 h-3.5 bg-[#3f5d56] rounded-sm"></div> Kuota Alokasi
                     </div>
                     <div class="flex items-center gap-2 text-[12px] font-bold text-[#113224]">
                         <div class="w-3.5 h-3.5 bg-[#006B4D] rounded-sm"></div> Prediksi AI
                     </div>
                </div>
            </div>

            <!-- History Table -->
            <div class="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                 <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 class="text-[16px] font-extrabold text-[#113224]">Histori Peringatan WhatsApp</h3>
                     <a href="riwayat_notifikasi.php" class="text-[12px] font-bold text-[#006B4D] hover:text-[#00573E] flex items-center gap-1 transition-colors">
                         Lihat Semua <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                     </a>
                 </div>
                 <table class="w-full text-left">
                     <thead>
                         <tr>
                             <th class="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-[140px]">Tanggal</th>
                             <th class="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pesan</th>
                             <th class="py-3 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 w-[120px]">Status</th>
                         </tr>
                     </thead>
                     <tbody class="text-[13px] text-gray-700">
                         <?php if (count($history) > 0): ?>
                             <?php foreach($history as $h): ?>
                             <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                 <td class="py-4 px-6"><?= date('d M Y', strtotime($h['tanggal'])) ?></td>
                                 <td class="py-4 px-6 truncate max-w-[250px]" title="<?= htmlspecialchars($h['pesan']) ?>"><?= htmlspecialchars($h['pesan']) ?></td>
                                 <td class="py-4 px-6">
                                     <span class="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded text-[11px] font-bold border border-[#A7F3D0]">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Dibaca
                                     </span>
                                 </td>
                             </tr>
                             <?php endforeach; ?>
                         <?php else: ?>
                             <tr>
                                 <td colspan="3" class="py-4 px-6 text-center text-gray-400">Belum ada histori peringatan.</td>
                             </tr>
                         <?php endif; ?>
                     </tbody>
                 </table>
            </div>

        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-[#F5F7F5] text-gray-500 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 border-t border-gray-200 font-medium mt-auto">
        <div>© 2026 GovTech AgriVision AI. Restricted Government Access Only.</div>
        <div class="flex gap-6">
            <a href="#" class="hover:text-gray-800 transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-gray-800 transition-colors">Terms of Service</a>
            <a href="#" class="hover:text-gray-800 transition-colors">Security Protocol</a>
            <a href="#" class="hover:text-gray-800 transition-colors">Contact Support</a>
        </div>
    </footer>
</body>
</html>
