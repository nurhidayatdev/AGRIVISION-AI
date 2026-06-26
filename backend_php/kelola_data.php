<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// 1. Data Isolation Logic (RBAC)
$role = $_SESSION['role'] ?? '';
$id_kabupaten = $_SESSION['id_kabupaten'] ?? null;

$is_provinsi_admin = in_array($role, ['Admin Provinsi', 'Admin Pusat', 'Kadis Provinsi']);

if ($is_provinsi_admin) {
    // Query to select ALL records for Admin Provinsi/Pusat
    $sql = "SELECT dap.*, mk.nama_kabupaten, mk.kode_bps 
            FROM data_alokasi_pupuk dap
            JOIN master_kabupaten mk ON dap.id_kabupaten = mk.id
            ORDER BY mk.nama_kabupaten ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
} else {
    // Query to select ONLY records for the user's specific Regency (Admin Kabupaten / PPL)
    $sql = "SELECT dap.*, mk.nama_kabupaten, mk.kode_bps 
            FROM data_alokasi_pupuk dap
            JOIN master_kabupaten mk ON dap.id_kabupaten = mk.id
            WHERE dap.id_kabupaten = :id_kabupaten
            ORDER BY mk.nama_kabupaten ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id_kabupaten', $id_kabupaten, PDO::PARAM_INT);
    $stmt->execute();
}

// 3. Fetch the results into an array
$data_alokasi = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Data - AgriVision AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
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
                  <path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z" fill="#006B4D" stroke="#0FE193" strokeWidth="1"/>
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
            <span className="text-[13px] text-white/90 font-medium"><?= date('l, d F Y') ?></span>
            <button class="relative text-white/90 hover:text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0FE193] rounded-full border-2 border-[#023E2D]"></span>
            </button>
            
            <div class="flex items-center gap-3 border-l border-white/20 pl-6 py-2">
                <div class="text-right">
                    <div class="text-[14px] font-bold leading-tight"><?= htmlspecialchars($_SESSION['nama_lengkap'] ?? 'User') ?></div>
                    <div class="text-[12px] text-white/70 font-medium"><?= htmlspecialchars($role) ?></div>
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
            <span class="hover:text-gray-700 cursor-pointer transition-colors">BERANDA</span>
            <span>/</span>
            <span class="hover:text-gray-700 cursor-pointer transition-colors">MANAJEMEN DATA</span>
            <span>/</span>
            <span class="text-gray-900">ALOKASI PUPUK</span>
        </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        <!-- Header Section -->
        <div class="flex items-center justify-between">
            <h1 class="text-[22px] font-extrabold text-[#113224] tracking-tight">Data Alokasi & Prediksi e-RDKK</h1>
            <a 
                href="import_data.php"
                class="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2.5 rounded flex items-center gap-2 transition-colors text-[13px] tracking-wide shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                Import Excel/BPS
            </a>
        </div>

        <!-- Filter Panel -->
        <div class="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-5 flex gap-4 items-end">
            <div class="flex-1 space-y-1.5">
                <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pencarian</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari Kabupaten atau Region..." 
                        class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400"
                    />
                </div>
            </div>

            <div class="w-[280px] space-y-1.5">
                <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode Bulan</label>
                <div class="relative">
                    <select class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                        <option>Semua Bulan</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                </div>
            </div>

            <div class="w-[280px] space-y-1.5">
                <label class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status Risiko</label>
                <div class="relative">
                    <select class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                        <option>Semua Status</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                </div>
            </div>

            <button class="h-[38px] px-5 border border-gray-200 rounded bg-white text-gray-700 text-[13px] font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
            </button>
        </div>

        <!-- Data Table -->
        <div class="bg-white rounded-md border border-gray-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex-1 flex flex-col min-h-0">
            <div class="overflow-x-auto flex-1 custom-scrollbar">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">Kode BPS</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kabupaten</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Luas Lahan (HA)</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Kuota Urea</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Prediksi Urea</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Kuota NPK</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Prediksi NPK</th>
                            <th class="py-4 px-6 border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[140px]">Status</th>
                        </tr>
                    </thead>
                    <tbody class="text-[13px]">
                        <?php if (count($data_alokasi) > 0): ?>
                            <?php foreach ($data_alokasi as $index => $row): ?>
                                
                                <?php
                                    // Dynamic Badges Switch
                                    $status = strtolower($row['status_risiko'] ?? 'aman');
                                    $badgeClass = '';
                                    
                                    switch($status) {
                                        case 'aman':
                                            $badgeClass = 'bg-emerald-50 text-[#059669] border-emerald-200';
                                            break;
                                        case 'waspada':
                                            $badgeClass = 'bg-amber-50 text-[#D97706] border-amber-200';
                                            break;
                                        case 'kritis':
                                        case 'defisit':
                                            $badgeClass = 'bg-red-50 text-[#DC2626] border-red-200';
                                            break;
                                        default:
                                            $badgeClass = 'bg-gray-50 text-gray-600 border-gray-200';
                                    }
                                    
                                    // Trend Icons (Using simple SVGs or just colored text logic)
                                    // Normally we would compare kuota vs prediksi for trends
                                    $urea_color = $row['prediksi_urea'] > $row['kuota_urea'] ? 'text-[#DC2626]' : ($row['prediksi_urea'] < $row['kuota_urea'] ? 'text-[#059669]' : 'text-gray-700');
                                    $npk_color = $row['prediksi_npk'] > $row['kuota_npk'] ? 'text-[#D97706]' : ($row['prediksi_npk'] < $row['kuota_npk'] ? 'text-[#059669]' : 'text-gray-700');
                                    
                                    // Striping logic
                                    $bg_class = ($index % 2 == 1) ? 'bg-[#FAFAFA]' : '';
                                ?>

                                <tr class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors <?= $bg_class ?>">
                                    <td class="py-4 px-6 text-gray-400 font-mono text-[12px]"><?= htmlspecialchars($row['kode_bps'] ?? '-') ?></td>
                                    <td class="py-4 px-6 font-bold text-gray-900"><?= htmlspecialchars($row['nama_kabupaten']) ?></td>
                                    
                                    <!-- Formatting Numbers using number_format -->
                                    <td class="py-4 px-6 text-right font-bold text-gray-700 font-mono"><?= number_format($row['luas_lahan'] ?? 0, 2, ',', '.') ?></td>
                                    <td class="py-4 px-6 text-right font-bold text-gray-700 font-mono"><?= number_format($row['kuota_urea'] ?? 0, 0, ',', '.') ?></td>
                                    <td class="py-4 px-6 text-right font-bold <?= $urea_color ?> font-mono flex items-center justify-end gap-1.5">
                                        <?= number_format($row['prediksi_urea'] ?? 0, 0, ',', '.') ?>
                                    </td>
                                    
                                    <td class="py-4 px-6 text-right font-bold text-gray-700 font-mono"><?= number_format($row['kuota_npk'] ?? 0, 0, ',', '.') ?></td>
                                    <td class="py-4 px-6 text-right font-bold <?= $npk_color ?> font-mono flex items-center justify-end gap-1.5">
                                        <?= number_format($row['prediksi_npk'] ?? 0, 0, ',', '.') ?>
                                    </td>
                                    
                                    <td class="py-4 px-6">
                                        <span class="inline-flex items-center justify-center px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider w-[68px] <?= $badgeClass ?>">
                                            <?= htmlspecialchars($row['status_risiko'] ?? 'AMAN') ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="8" class="py-10 px-6 text-center text-gray-500 font-medium">Tidak ada data ditemukan.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500 bg-white rounded-b-md">
                <div>
                    Menampilkan total <span class="font-bold text-gray-700"><?= count($data_alokasi) ?></span> data
                </div>
                <div class="flex items-center gap-1">
                    <button class="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">Seb</button>
                    <button class="px-3 py-1.5 border border-[#10B981] bg-[#ECFDF5] text-[#059669] font-bold rounded">1</button>
                    <button class="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-colors">Lanjut</button>
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
</div>

</body>
</html>
