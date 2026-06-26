<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// 1. Data Isolation Logic (RBAC)
$role = $_SESSION['role'] ?? '';
$is_provinsi_admin = in_array($role, ['Admin Provinsi', 'Admin Pusat', 'Kadis Provinsi']);
$id_kabupaten = $_SESSION['id_kabupaten'] ?? null;

$params = [];
$whereClause = "";
if (!$is_provinsi_admin && $id_kabupaten) {
    $whereClause = "WHERE dap.id_kabupaten = :id_kabupaten";
    $params[':id_kabupaten'] = $id_kabupaten;
}

// 2. Count Total Urea, Total NPK, Total Lahan
$sql_totals = "SELECT 
    SUM(luas_lahan) as total_lahan, 
    SUM(kuota_urea) as total_urea, 
    SUM(kuota_npk) as total_npk,
    SUM(prediksi_urea) as total_prediksi_urea,
    SUM(prediksi_npk) as total_prediksi_npk
    FROM data_alokasi_pupuk dap
    $whereClause
";
$stmt = $pdo->prepare($sql_totals);
$stmt->execute($params);
$totals = $stmt->fetch(PDO::FETCH_ASSOC);

$total_lahan = $totals['total_lahan'] ?? 0;
$total_urea = $totals['total_urea'] ?? 0;
$total_npk = $totals['total_npk'] ?? 0;

// 3. Fetch Top 3 Wilayah Kritis
$sql_kritis = "SELECT dap.*, mk.nama_kabupaten 
               FROM data_alokasi_pupuk dap
               JOIN master_kabupaten mk ON dap.id_kabupaten = mk.id
               ";
if ($whereClause) {
    $sql_kritis .= $whereClause . " AND ";
} else {
    $sql_kritis .= " WHERE ";
}
// We check for 'Kritis', 'Waspada', 'Defisit'
$sql_kritis .= " (LOWER(dap.status_risiko) = 'kritis' OR LOWER(dap.status_risiko) = 'waspada' OR LOWER(dap.status_risiko) = 'defisit')
                 ORDER BY 
                 CASE 
                    WHEN LOWER(dap.status_risiko) = 'kritis' THEN 1
                    WHEN LOWER(dap.status_risiko) = 'defisit' THEN 1
                    WHEN LOWER(dap.status_risiko) = 'waspada' THEN 2
                    ELSE 3
                 END ASC, 
                 dap.prediksi_urea DESC
                 LIMIT 3";

$stmt_kritis = $pdo->prepare($sql_kritis);
$stmt_kritis->execute($params);
$kritis_data = $stmt_kritis->fetchAll(PDO::FETCH_ASSOC);

// Map Area focus
$focus_area = count($kritis_data) > 0 ? $kritis_data[0] : null;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - AgriVision AI</title>
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
<body class="bg-[#F5F7F5] min-h-screen flex flex-col font-sans relative">

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
                <a href="dashboard.php" class="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Dashboard</a>
                <a href="kelola_data.php" class="px-6 h-full flex items-center hover:bg-[#004D36] transition-colors text-white/90">Kelola Data</a>
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

    <!-- Filter / Breadcrumb Bar -->
    <div class="bg-white border-b border-gray-200 px-6 h-[60px] flex items-center justify-between shrink-0 shadow-sm z-10">
        <div class="flex items-center text-[11px] font-bold tracking-widest text-gray-400 gap-2">
            <span class="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</span>
            <span>/</span>
            <span class="hover:text-gray-700 cursor-pointer transition-colors">PUSAT KOMANDO ANALITIK</span>
            <span>/</span>
            <span class="text-gray-900 uppercase"><?= $is_provinsi_admin ? 'SULAWESI SELATAN' : htmlspecialchars($_SESSION['nama_kabupaten'] ?? 'KABUPATEN') ?></span>
        </div>

        <div class="flex items-center gap-3">
            <button class="flex items-center justify-between w-[160px] px-3 py-2 border border-gray-300 rounded text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <span>Filter Jenis: Semua</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <a href="proses_cetak_pdf.php?musim_tanam=MT I&sertakan_ai=true" class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export PDF
            </a>
        </div>
    </div>

    <?php if (isset($_GET['ai_success'])): ?>
    <div class="mx-6 mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">Proses Analisis Gemini AI berhasil dieksekusi.</span>
    </div>
    <?php endif; ?>

    <?php if (isset($_GET['error'])): ?>
    <div class="mx-6 mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">Terjadi kesalahan: <?= htmlspecialchars($_GET['error']) ?></span>
    </div>
    <?php endif; ?>

    <!-- Main Content -->
    <main class="flex-1 p-6 flex gap-6 overflow-hidden">
        <!-- Left Sidebar -->
        <div class="w-[300px] flex flex-col gap-6 shrink-0 overflow-y-auto pb-4 custom-scrollbar">
            
            <!-- Ringkasan Alokasi -->
            <div class="bg-white rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
                <h2 class="text-[13px] font-bold text-gray-500 tracking-wider uppercase mb-6">Ringkasan Alokasi</h2>
                
                <div class="mb-6">
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-[40px] font-extrabold text-[#113224] tracking-tighter leading-none"><?= number_format($total_lahan, 0, ',', '.') ?></span>
                        <span class="text-lg font-bold text-[#113224]">Ha</span>
                    </div>
                    <div class="text-[11px] font-bold text-gray-500 tracking-wider mt-2">TOTAL LUAS LAHAN</div>
                </div>

                <div class="h-[1px] bg-gray-100 w-full mb-6"></div>

                <div class="mb-6">
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-[40px] font-extrabold text-[#006B4D] tracking-tighter leading-none"><?= number_format($total_urea, 0, ',', '.') ?></span>
                        <span class="text-lg font-bold text-[#006B4D]">Ton</span>
                    </div>
                    <div class="text-[11px] font-bold text-gray-500 tracking-wider mt-2">TOTAL KUOTA UREA</div>
                </div>

                <div class="h-[1px] bg-gray-100 w-full mb-6"></div>

                <div>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-[40px] font-extrabold text-[#006B4D] tracking-tighter leading-none"><?= number_format($total_npk, 0, ',', '.') ?></span>
                        <span class="text-lg font-bold text-[#006B4D]">Ton</span>
                    </div>
                    <div class="text-[11px] font-bold text-gray-500 tracking-wider mt-2">TOTAL KUOTA NPK</div>
                </div>
            </div>

            <!-- Wilayah Kritis -->
            <div class="bg-[#FCFDFD] rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
                <div class="px-5 py-3.5 border-b border-red-100 flex items-center justify-between bg-red-50/40 rounded-t-md">
                    <div class="flex items-center gap-2.5 text-[#B91C1C]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        <h2 class="text-[13px] font-extrabold tracking-widest uppercase">Wilayah Kritis</h2>
                    </div>
                    <span class="bg-red-200 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">LIVE</span>
                </div>

                <div class="p-5 flex flex-col gap-6">
                    <?php if (count($kritis_data) > 0): ?>
                        <?php foreach ($kritis_data as $row): ?>
                            <?php 
                                $status = strtolower($row['status_risiko']);
                                $bg_status = $status == 'kritis' || $status == 'defisit' ? 'bg-[#B91C1C]' : 'bg-[#D97706]';
                                $text_color = $status == 'kritis' || $status == 'defisit' ? 'text-[#B91C1C]' : 'text-[#D97706]';
                            ?>
                            <div class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="font-extrabold text-[15px] text-gray-900"><?= htmlspecialchars($row['nama_kabupaten']) ?></h3>
                                    <span class="<?= $bg_status ?> text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider leading-none"><?= htmlspecialchars($row['status_risiko']) ?></span>
                                </div>
                                <p class="text-[13px] text-gray-600 leading-relaxed mb-3 pr-2">
                                    <?= htmlspecialchars($row['narasi_rekomendasi'] ?? 'Prediksi AI menunjukkan indikasi defisit pupuk. Segera lakukan penyesuaian alokasi atau koordinasi antar wilayah.') ?>
                                </p>
                                <div class="flex items-center gap-1.5 <?= $text_color ?> text-[12px] font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                                    <span>
                                        <?php if ($row['prediksi_urea'] > $row['kuota_urea']): ?>
                                            Defisit Urea <?= number_format($row['prediksi_urea'] - $row['kuota_urea'], 0, ',', '.') ?> Ton
                                        <?php else: ?>
                                            Perhatian Khusus
                                        <?php endif; ?>
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <a href="proses_gemini.php?id_alokasi=<?= $row['id'] ?>" class="text-[11px] text-blue-600 font-bold hover:underline">Re-Run AI Analysis</a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="text-[13px] text-gray-500 italic text-center py-4">Semua wilayah dalam kondisi aman.</div>
                    <?php endif; ?>
                </div>
            </div>

        </div>

        <!-- Right Main Area -->
        <div class="flex-1 flex flex-col gap-6 overflow-hidden">
            
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-[#1E3B33] to-[#254A41] rounded-md px-8 py-7 flex items-center justify-between text-white shadow-sm shrink-0 relative overflow-hidden">
                <!-- Decorative Background Pattern Overlay (Subtle) -->
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                
                <div class="relative z-10">
                    <h1 class="text-[22px] font-extrabold tracking-tight mb-2">Status Ketahanan Pupuk: <?= $is_provinsi_admin ? 'Sulawesi Selatan' : htmlspecialchars($_SESSION['nama_kabupaten'] ?? 'Kabupaten') ?></h1>
                    <p class="text-white/80 text-[14px] font-medium">Analisis prediktif berbasis data cuaca dan realisasi e-RDKK bulan ini.</p>
                </div>
                
                <?php if ($focus_area): ?>
                <a href="proses_gemini.php?id_alokasi=<?= $focus_area['id'] ?>" class="relative z-10 bg-[#34D399] hover:bg-[#10B981] text-[#022C22] font-bold px-5 py-2.5 rounded flex items-center gap-2 transition-colors shadow-sm text-[13px] tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#022C22] fill-[#022C22]"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 3v4"/><path d="M17 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>
                    Jalankan Gemini AI (<?= htmlspecialchars($focus_area['nama_kabupaten']) ?>)
                </a>
                <?php endif; ?>
            </div>

            <!-- Map Area -->
            <div class="flex-1 bg-[#D1DFD9]/30 rounded-md border border-gray-200 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                <!-- Simulated Map Background (Lines/Grid) -->
                <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #94A3B8 10px, #94A3B8 11px);"></div>
                
                <span class="text-gray-400/80 font-bold text-xl tracking-widest uppercase relative z-0">Map Placeholder</span>

                <?php if ($focus_area): ?>
                <!-- Floating Overlay Card -->
                <div class="absolute top-6 left-6 w-[300px] bg-white rounded-md shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col z-10 border border-gray-100 overflow-hidden">
                    <!-- Header -->
                    <div class="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                        <h3 class="font-extrabold text-[15px] text-[#113224] uppercase leading-snug w-3/4 tracking-tight">
                            Fokus Area: <?= htmlspecialchars($focus_area['nama_kabupaten']) ?>
                        </h3>
                        <?php 
                            $status = strtolower($focus_area['status_risiko']);
                            $bg_status = $status == 'kritis' || $status == 'defisit' ? 'bg-[#B91C1C]' : 'bg-[#D97706]';
                        ?>
                        <div class="<?= $bg_status ?> text-white text-[10px] font-bold px-2 py-1 rounded text-center leading-tight tracking-wider shrink-0 uppercase">
                            STATUS:<br/><?= htmlspecialchars($focus_area['status_risiko']) ?>
                        </div>
                    </div>

                    <div class="p-5 flex flex-col">
                        <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Prediksi Kebutuhan AI (Urea)
                        </div>
                        <div class="flex items-baseline gap-1.5 mb-6">
                            <span class="text-[28px] font-extrabold text-[#113224] tracking-tight leading-none"><?= number_format($focus_area['prediksi_urea'] ?? 0, 0, ',', '.') ?></span>
                            <span class="text-[14px] font-bold text-gray-500">Ton</span>
                        </div>

                        <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Trend Kebutuhan
                        </div>
                        
                        <!-- Bar Chart Mockup -->
                        <div class="flex items-end gap-2.5 h-[52px] mb-7">
                            <div class="flex-1 bg-gray-200 h-[35%] rounded-sm hover:bg-gray-300 transition-colors cursor-pointer relative group">
                                <div class="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded">Bulan -2</div>
                            </div>
                            <div class="flex-1 bg-gray-200 h-[65%] rounded-sm hover:bg-gray-300 transition-colors cursor-pointer relative group">
                                <div class="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded">Bulan -1</div>
                            </div>
                            <div class="flex-1 bg-[#B91C1C] h-[100%] rounded-sm hover:bg-red-800 transition-colors cursor-pointer shadow-[0_0_10px_rgba(185,28,28,0.3)] relative group">
                                <div class="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-[#B91C1C] text-white text-[10px] font-bold py-1 px-2 rounded">Bulan Ini</div>
                            </div>
                        </div>

                        <a href="kelola_data.php" class="w-full py-2.5 border border-[#006B4D] text-[#006B4D] font-bold text-[13px] rounded hover:bg-[#006B4D] hover:text-white transition-colors tracking-wide text-center block">
                            LIHAT DETAIL WILAYAH
                        </a>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Map Controls -->
                <div class="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
                    <div class="bg-white rounded shadow-md flex flex-col overflow-hidden border border-gray-100">
                        <button class="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 border-b border-gray-100 transition-colors" title="Zoom In">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                        <button class="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" title="Zoom Out">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                        </button>
                    </div>
                    <button class="w-9 h-9 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600 border border-gray-100 transition-colors" title="My Location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
                    </button>
                </div>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#F5F7F5] text-gray-500 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 border-t border-gray-200 font-medium">
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
