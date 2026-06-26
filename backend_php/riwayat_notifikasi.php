<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// Data Isolation Logic (RBAC)
$role = $_SESSION['role'] ?? '';
$is_provinsi_admin = in_array($role, ['Admin Provinsi', 'Admin Pusat', 'Kadis Provinsi']);
$id_kabupaten = $_SESSION['id_kabupaten'] ?? null;

$params = [];
$whereClause = "";
if (!$is_provinsi_admin && $id_kabupaten) {
    $whereClause = "WHERE rp.id_kabupaten = :id_kabupaten";
    $params[':id_kabupaten'] = $id_kabupaten;
}

// Fetch all records from riwayat_peringatan JOIN master_kabupaten
// and optionally JOIN users to get recipient names
$sql = "SELECT rp.*, mk.nama_kabupaten, u.nama_lengkap as recipient_name
        FROM riwayat_peringatan rp
        JOIN master_kabupaten mk ON rp.id_kabupaten = mk.id
        LEFT JOIN users u ON mk.id = u.id_kabupaten AND u.role = 'Admin Kabupaten'
        $whereClause
        ORDER BY rp.tanggal DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Summary Counts
$total_alerts = count($logs);
$total_pending = 0;
$kabupaten_counts = [];

foreach ($logs as $log) {
    $status = strtolower($log['status'] ?? '');
    // Using Kritis and Waspada as pending actions for summary
    if (in_array($status, ['kritis', 'waspada', 'defisit', 'menunggu'])) {
        $total_pending++;
    }
    
    $kab = $log['nama_kabupaten'];
    if (!isset($kabupaten_counts[$kab])) {
        $kabupaten_counts[$kab] = 0;
    }
    $kabupaten_counts[$kab]++;
}

arsort($kabupaten_counts);
$top_kabupaten = key($kabupaten_counts) ?? '-';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Riwayat Notifikasi - AgriVision AI</title>
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
    <div class="bg-white border-b border-gray-200 px-6 h-[48px] flex items-center shrink-0 shadow-sm z-10">
        <div class="flex items-center text-[13px] font-medium text-gray-500 gap-2">
            <a href="dashboard.php" class="hover:text-gray-900 cursor-pointer transition-colors">Beranda</a>
            <span class="text-gray-400">›</span>
            <span class="hover:text-gray-900 cursor-pointer transition-colors">Notifikasi</span>
            <span class="text-gray-400">›</span>
            <span class="text-[#113224] font-bold">Riwayat Alert</span>
        </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-6 flex flex-col gap-6 overflow-x-hidden">
        
        <!-- Header Section -->
        <div>
            <h1 class="text-[22px] font-extrabold text-[#113224] tracking-tight mb-1">Riwayat Peringatan Otomatis WhatsApp</h1>
            <p class="text-[13px] text-gray-500">Daftar alert defisit pupuk bersubsidi yang dikirim ke Dinas Kabupaten</p>
        </div>

        <!-- Summary Cards -->
        <div class="flex gap-6">
            <!-- Card 1 -->
            <div class="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 p-6 flex flex-col justify-center">
                <div class="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Alert Terkirim</div>
                <div class="text-[42px] font-extrabold text-[#113224] leading-none tracking-tighter"><?= $total_alerts ?></div>
            </div>
            
            <!-- Card 2 -->
            <div class="bg-white rounded-sm border-y border-r border-gray-200 border-l-4 border-l-[#B91C1C] shadow-sm flex-1 p-6 flex flex-col justify-center">
                <div class="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alert Belum Ditindaklanjuti</div>
                <div class="text-[42px] font-extrabold text-[#B91C1C] leading-none tracking-tighter"><?= $total_pending ?></div>
            </div>

            <!-- Card 3 -->
            <div class="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 p-6 flex flex-col justify-center">
                <div class="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kabupaten Paling Sering Alert</div>
                <div class="text-[28px] font-extrabold text-[#113224] leading-tight tracking-tight"><?= htmlspecialchars($top_kabupaten) ?></div>
            </div>
        </div>

        <!-- Filters and Table Container -->
        <div class="bg-white rounded-sm border border-gray-200 shadow-sm flex-1 flex flex-col">
            
            <!-- Filters -->
            <div class="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-4 flex-wrap">
                    <!-- Select Kabupaten -->
                    <div class="relative w-[180px]">
                        <select class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-[#F8FAFC] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                            <option>Semua Kabupaten</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                    </div>

                    <!-- Select Status -->
                    <div class="relative w-[180px]">
                        <select class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-[#F8FAFC] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                            <option>Semua Status</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                    </div>

                    <!-- Date Range -->
                    <div class="flex items-center gap-2">
                        <input type="text" value="<?= date('01/m/Y') ?>" readOnly class="w-[120px] px-3 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 bg-[#F8FAFC] focus:outline-none"/>
                        <span class="text-gray-400 font-bold">-</span>
                        <input type="text" value="<?= date('t/m/Y') ?>" readOnly class="w-[120px] px-3 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 bg-[#F8FAFC] focus:outline-none"/>
                    </div>
                </div>

                <!-- Search -->
                <div class="relative w-[280px]">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                    </div>
                    <input type="text" placeholder="Cari pesan atau kabupaten..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400 bg-[#F8FAFC]"/>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto flex-1 custom-scrollbar">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[60px]">No</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[180px]">Tanggal & Waktu</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider w-[140px]">Kabupaten</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider">Pesan WhatsApp</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[120px]">WA Status</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[120px]">Action Status</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-900 uppercase tracking-wider text-center w-[140px]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="text-[13px]">
                        <?php if (count($logs) > 0): ?>
                            <?php $no = 1; foreach ($logs as $log): ?>
                                <?php
                                    $pesan = $log['pesan'] ?? '';
                                    $status_db = strtolower($log['status'] ?? '');
                                    
                                    // Map Action Status
                                    $action_status_class = '';
                                    $action_status_text = '';
                                    if (in_array($status_db, ['kritis', 'waspada', 'defisit', 'menunggu'])) {
                                        $action_status_class = 'bg-amber-100/50 text-[#D97706] border-amber-200';
                                        $action_status_text = 'MENUNGGU';
                                    } else {
                                        $action_status_class = 'bg-[#D1FAE5]/50 text-[#059669] border-[#A7F3D0]';
                                        $action_status_text = 'SELESAI';
                                    }
                                    
                                    // Map WA Status (Simulated based on date for demo purposes, or default to Terkirim/Dibaca)
                                    // Normally we would have wa_status in the table, but we mock it here based on ID or something pseudo-random if needed, or assume all are sent.
                                    $is_recent = strtotime($log['tanggal']) > strtotime('-2 days');
                                    $wa_status_text = $is_recent ? 'TERKIRIM' : 'DIBACA';
                                    $wa_status_class = $is_recent ? 'bg-blue-100/50 text-blue-600 border-blue-200' : 'bg-green-100/50 text-green-600 border-green-200';
                                ?>
                                <tr class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    <td class="py-5 px-6 text-gray-500"><?= $no++ ?></td>
                                    <td class="py-5 px-6 text-gray-600"><?= date('d M Y, H:i', strtotime($log['tanggal'])) ?> WIB</td>
                                    <td class="py-5 px-6 font-bold text-gray-900"><?= htmlspecialchars($log['nama_kabupaten']) ?></td>
                                    <td class="py-5 px-6 text-gray-500 truncate max-w-[250px]" title="<?= htmlspecialchars($pesan) ?>"><?= htmlspecialchars($pesan) ?></td>
                                    
                                    <!-- WA Status Badge -->
                                    <td class="py-5 px-6 text-center">
                                        <span class="inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border <?= $wa_status_class ?>">
                                            <?= $wa_status_text ?>
                                        </span>
                                    </td>
                                    
                                    <!-- Action Status Badge -->
                                    <td class="py-5 px-6 text-center">
                                        <span class="inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border <?= $action_status_class ?>">
                                            <?= $action_status_text ?>
                                        </span>
                                    </td>

                                    <td class="py-5 px-6 text-center">
                                        <button class="px-4 py-1.5 border border-[#006B4D] text-[#006B4D] rounded-sm text-[12px] font-bold hover:bg-[#006B4D] hover:text-white transition-colors">Lihat Detail</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" class="py-10 px-6 text-center text-gray-500 font-medium">Tidak ada riwayat peringatan.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500">
                <div>
                    Menampilkan <span class="font-bold text-gray-700">1</span> sampai <span class="font-bold text-gray-700"><?= min(10, count($logs)) ?></span> dari <span class="font-bold text-gray-700"><?= count($logs) ?></span> data
                </div>
                <div class="flex items-center gap-2">
                    <button class="px-4 py-2 border border-gray-200 rounded-sm text-gray-400 hover:bg-gray-50 transition-colors">Sebelumnya</button>
                    <button class="px-4 py-2 border border-[#006B4D] bg-[#006B4D] text-white font-bold rounded-sm">1</button>
                    <button class="px-4 py-2 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors" <?= count($logs) <= 10 ? 'disabled' : '' ?>>2</button>
                    <button class="px-4 py-2 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">Selanjutnya</button>
                </div>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-[#E5E7EB] text-gray-600 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 font-bold mt-auto border-t border-gray-300">
        <div>© 2026 GovTech AgriVision AI. Restricted Government Access Only.</div>
        <div class="flex gap-6">
            <a href="#" class="hover:text-gray-900 transition-colors">Security Policy</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Contact Admin</a>
        </div>
    </footer>

</body>
</html>
