<?php
session_start();
require_once 'koneksi.php';
require_once 'auth_check.php';

// Data Isolation Logic (RBAC) - Restrict to Super Admin / Admin Provinsi
$role = $_SESSION['role'] ?? '';
$is_super_admin = in_array($role, ['Admin Provinsi', 'Super Admin Provinsi', 'Admin Pusat']);

if (!$is_super_admin) {
    header("Location: dashboard.php?error=unauthorized");
    exit;
}

// Handle Add User Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_user'])) {
    $nip = $_POST['nip'] ?? '';
    $nama_lengkap = $_POST['nama_lengkap'] ?? '';
    $role_baru = $_POST['role'] ?? '';
    $id_kab = $_POST['id_kabupaten'] ?? null;
    $id_kabupaten = ($id_kab === '') ? null : $id_kab;
    $password = $_POST['password'] ?? '';
    
    if (!empty($nip) && !empty($nama_lengkap) && !empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql_insert = "INSERT INTO users (nip, nama_lengkap, role, password, id_kabupaten) VALUES (:nip, :nama, :role, :pass, :id_kab)";
        $stmt_insert = $pdo->prepare($sql_insert);
        $stmt_insert->execute([
            ':nip' => $nip,
            ':nama' => $nama_lengkap,
            ':role' => $role_baru,
            ':pass' => $hashed_password,
            ':id_kab' => $id_kabupaten
        ]);
        
        header("Location: kelola_pengguna.php?success=1");
        exit;
    }
}

// Fetch Master Kabupaten for the dropdown
$stmt_kab = $pdo->query("SELECT id, nama_kabupaten FROM master_kabupaten ORDER BY nama_kabupaten ASC");
$kabupatens = $stmt_kab->fetchAll(PDO::FETCH_ASSOC);

// Fetch All Users
$sql = "SELECT u.*, mk.nama_kabupaten 
        FROM users u 
        LEFT JOIN master_kabupaten mk ON u.id_kabupaten = mk.id 
        ORDER BY u.id DESC";
$stmt = $pdo->query($sql);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pengguna - AgriVision AI</title>
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
<body class="min-h-screen bg-[#F5F7F5] flex flex-col font-sans relative">

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
                <a href="kelola_pengguna.php" class="px-6 h-full flex items-center bg-[#006B4D] text-white font-bold tracking-wide">Kelola Pengguna</a>
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
    <div class="bg-white px-6 py-4 shrink-0 border-b border-gray-200">
        <div class="flex items-center text-[13px] font-medium text-gray-500 gap-2 mb-2">
            <a href="dashboard.php" class="hover:text-gray-900 cursor-pointer transition-colors">Beranda</a>
            <span class="text-gray-400">›</span>
            <span class="hover:text-gray-900 cursor-pointer transition-colors">Pengaturan</span>
            <span class="text-gray-400">›</span>
            <span class="text-[#113224] font-bold">Kelola Pengguna</span>
        </div>
        <h1 class="text-[22px] font-extrabold text-[#113224] tracking-tight">Daftar Akun Pengguna Sistem</h1>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        <!-- Filter and Action Bar -->
        <div class="bg-white rounded-md border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <!-- Search -->
                <div class="relative w-[280px]">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                    </div>
                    <input type="text" placeholder="Cari nama atau NIP..." class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400" />
                </div>

                <!-- Role Filter -->
                <div class="relative w-[180px]">
                    <select class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                        <option>Semua Role</option>
                        <option>Admin Provinsi</option>
                        <option>Admin Kabupaten</option>
                        <option>PPL</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                </div>
            </div>

            <button onclick="openModal()" class="bg-[#022C22] hover:bg-[#042f2e] text-white font-bold px-4 py-2.5 rounded-sm flex items-center gap-2 transition-colors text-[13px] shadow-sm tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Pengguna Baru
            </button>
        </div>

        <!-- User Table -->
        <div class="bg-white rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
            <div class="overflow-x-auto flex-1 custom-scrollbar">
                <table class="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[60px]">No</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[160px]">NIP</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[140px]">Role</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[200px]">Kabupaten/Instansi</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[120px]">Status Akun</th>
                            <th class="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[100px]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="text-[13px] text-gray-700">
                        <?php if (count($users) > 0): ?>
                            <?php $no = 1; foreach ($users as $index => $u): ?>
                                <?php
                                    $u_role = $u['role'] ?? '';
                                    $role_class = 'bg-gray-200 text-gray-600 border-gray-300';
                                    if ($u_role === 'Admin Pusat' || $u_role === 'Admin Provinsi' || $u_role === 'Super Admin Provinsi') {
                                        $role_class = 'bg-[#1e3a33] text-white border-[#1e3a33]';
                                    } elseif ($u_role === 'PPL') {
                                        $role_class = 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]';
                                    }
                                    
                                    // For demo, standardizing everyone as Active
                                    $status_color = 'bg-[#10B981]';
                                    $status_text = 'Aktif';
                                    
                                    $row_class = $index % 2 == 1 ? 'bg-gray-50/30' : '';
                                ?>
                                <tr class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors <?= $row_class ?>">
                                    <td class="py-5 px-6"><?= $no++ ?></td>
                                    <td class="py-5 px-6 font-mono font-bold tracking-tight text-gray-600"><?= htmlspecialchars($u['nip']) ?></td>
                                    <td class="py-5 px-6 font-bold text-gray-900"><?= htmlspecialchars($u['nama_lengkap']) ?></td>
                                    <td class="py-5 px-6">
                                        <span class="<?= $role_class ?> px-2.5 py-1 rounded-sm text-[11px] font-medium border"><?= htmlspecialchars($u_role) ?></span>
                                    </td>
                                    <td class="py-5 px-6"><?= htmlspecialchars($u['nama_kabupaten'] ?? 'Provinsi / Pusat') ?></td>
                                    <td class="py-5 px-6">
                                        <div class="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                                            <div class="w-2 h-2 rounded-full <?= $status_color ?>"></div> <?= $status_text ?>
                                        </div>
                                    </td>
                                    <td class="py-5 px-6">
                                        <div class="flex items-center justify-end gap-3">
                                            <button class="text-[#006B4D] hover:text-[#004D36] transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button class="text-[#DC2626] hover:text-red-800 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" class="py-8 px-6 text-center text-gray-500">Belum ada data pengguna.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500 bg-white rounded-b-md">
                <div>Menampilkan <span class="font-bold text-gray-700">1</span> hingga <span class="font-bold text-gray-700"><?= min(count($users), 10) ?></span> dari <span class="font-bold text-gray-700"><?= count($users) ?></span> data</div>
                <div class="flex items-center gap-1">
                    <button class="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50 transition-colors">Sebelumnya</button>
                    <button class="px-3 py-1.5 border border-[#022C22] bg-[#022C22] text-white font-bold rounded-sm">1</button>
                    <button class="px-3 py-1.5 border border-gray-200 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors">Selanjutnya</button>
                </div>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-[#E5E7EB] text-gray-600 py-5 px-6 flex items-center justify-between text-[12px] shrink-0 font-bold mt-auto border-t border-gray-300">
        <div>© 2026 GovTech AgriVision AI. Restricted Government Access Only.</div>
        <div class="flex gap-6">
            <a href="#" class="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Security Protocol</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Contact Support</a>
        </div>
    </footer>

    <!-- Modal Overlay -->
    <div id="add-user-modal" class="fixed inset-0 bg-black/40 z-40 hidden flex items-center justify-center p-4 backdrop-blur-sm">
        <!-- Modal Container -->
        <div class="bg-white rounded-md shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <!-- Modal Header -->
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-[18px] font-extrabold text-[#113224] tracking-tight">Tambah Pengguna Baru</h2>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Form -->
            <form method="POST" action="kelola_pengguna.php">
                <input type="hidden" name="add_user" value="1">
                <!-- Modal Body -->
                <div class="p-6 flex flex-col gap-5">
                    
                    <!-- NIP -->
                    <div class="space-y-1.5">
                        <label class="text-[13px] font-bold text-[#113224]">NIP</label>
                        <input type="text" name="nip" required placeholder="Masukkan Nomor Induk Pegawai" class="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400" />
                    </div>

                    <!-- Nama Lengkap -->
                    <div class="space-y-1.5">
                        <label class="text-[13px] font-bold text-[#113224]">Nama Lengkap</label>
                        <input type="text" name="nama_lengkap" required placeholder="Beserta gelar akademik" class="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400" />
                    </div>

                    <!-- Role -->
                    <div class="space-y-1.5">
                        <label class="text-[13px] font-bold text-[#113224]">Role</label>
                        <div class="relative">
                            <select name="role" required class="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                                <option value="">Pilih Role Sistem</option>
                                <option value="Admin Provinsi">Admin Provinsi</option>
                                <option value="Admin Kabupaten">Admin Kabupaten</option>
                                <option value="PPL">PPL</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                        </div>
                    </div>

                    <!-- Kabupaten/Instansi -->
                    <div class="space-y-1.5">
                        <label class="text-[13px] font-bold text-[#113224]">Kabupaten/Instansi</label>
                        <div class="relative">
                            <select name="id_kabupaten" class="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                                <option value="">(Provinsi / Pusat)</option>
                                <?php foreach($kabupatens as $kab): ?>
                                    <option value="<?= $kab['id'] ?>"><?= htmlspecialchars($kab['nama_kabupaten']) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                        </div>
                    </div>

                    <!-- Password Row -->
                    <div class="flex gap-4">
                        <div class="space-y-1.5 flex-1">
                            <label class="text-[13px] font-bold text-[#113224]">Password</label>
                            <div class="relative">
                                <input type="password" name="password" required placeholder="Min. 8 karakter" class="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400" />
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button type="button" onclick="closeModal()" class="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold text-[13px] rounded-sm hover:bg-gray-100 transition-colors">
                        Batal
                    </button>
                    <button type="submit" class="px-5 py-2.5 bg-[#022C22] hover:bg-[#042f2e] text-white font-bold text-[13px] rounded-sm transition-colors shadow-sm">
                        Simpan Akun
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openModal() {
            document.getElementById('add-user-modal').classList.remove('hidden');
        }
        function closeModal() {
            document.getElementById('add-user-modal').classList.add('hidden');
        }
    </script>
</body>
</html>
