# Test Case: Halaman Login & Dashboard (AGRIVISION-AI)

Berikut adalah rancangan *test case* yang telah disesuaikan 100% dengan semua fitur terbaru (Validasi *Real-Time*, NIP 18 Digit, Keamanan Sandi, Lupa Sandi Modal, dsb) pada proyek AGRIVISION-AI Anda.

## 1. Test Case Halaman Login

| No | Test Case ID | Test Scenario | Test Case | Pre Condition | Test Step | expected Results | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `TC_LOGIN_01` | Masuk ke aplikasi | Berhasil login dengan kredensial valid | Halaman Login | 1. Input NIP (persis 18 digit angka)<br>2. Input sandi kuat (min. 8 karakter, kapital, kecil, angka, simbol)<br>3. Klik tombol OTORISASI MASUK | Sistem mengarahkan user ke halaman Dashboard | |
| 2 | `TC_LOGIN_02` | Validasi Input | Cek filter non-angka pada NIP | Halaman Login | 1. Ketik huruf atau simbol (misal: "ABC!") pada kolom NIP | Karakter huruf/simbol diabaikan dan tidak muncul di kolom input (hanya menerima angka) | |
| 3 | `TC_LOGIN_03` | Validasi *Real-time* | NIP kurang/lebih dari 18 digit | Halaman Login | 1. Ketik NIP selain 18 digit (misal 5 digit) | Garis pinggir input menjadi merah, dan muncul teks error *"Harus tepat 18 digit angka"* secara seketika (*real-time*) di bawah input | |
| 4 | `TC_LOGIN_04` | Validasi *Real-time* | Sandi tidak memenuhi standar kuat | Halaman Login | 1. Ketik sandi lemah (misal "123") | Garis pinggir input menjadi merah, dan muncul teks kriteria keamanan secara *real-time* di bawah input | |
| 5 | `TC_LOGIN_05` | Masuk ke aplikasi | Gagal login (Kredensial salah di *backend*) | Halaman Login | 1. Input NIP dan sandi yang valid secara format, tapi salah (tidak terdaftar)<br>2. Klik tombol OTORISASI MASUK | Sistem menampilkan pesan error dari backend (misal: "Login gagal. Periksa kembali NIP dan Kata Sandi Anda.") | |
| 6 | `TC_LOGIN_06` | Masuk ke aplikasi | Gagal login (Form kosong) | Halaman Login | 1. Kosongkan NIP dan password<br>2. Klik tombol OTORISASI MASUK | Browser menampilkan peringatan form wajib diisi (*required*) | |
| 7 | `TC_LOGIN_07` | Interaksi UI | Cek fitur Show/Hide Password | Halaman Login | 1. Input teks pada field password<br>2. Klik icon mata (Eye) di sebelah kanan | Teks password berubah dari format tersembunyi menjadi teks biasa, dan sebaliknya | |
| 8 | `TC_LOGIN_08` | Interaksi UI | Cek Checkbox "Ingat Sesi Saya" | Halaman Login | 1. Centang kotak "Ingat Sesi Saya"<br>2. Lakukan login berhasil<br>3. *Logout* | NIP otomatis terisi di kolom input saat kembali ke halaman Login (berasal dari `localStorage`). Masa aktif sesi di server juga menjadi 30 hari. | |
| 9 | `TC_LOGIN_09` | Interaksi UI | Klik tautan "Lupa Sandi?" | Halaman Login | 1. Klik teks "Lupa Sandi?" | Muncul *Popup/Modal* di tengah layar yang menyuruh user menghubungi Administrator Provinsi / IT Support | |
| 10 | `TC_LOGIN_10` | Interaksi UI | Cek status Loading saat login | Halaman Login | 1. Input kredensial valid<br>2. Klik tombol OTORISASI MASUK | Teks tombol berubah menjadi "MEMPROSES...", tombol menjadi redup (opacity 70%) dan tidak bisa diklik (disabled) selama proses ke server | |

<br>

## 2. Test Case Halaman Dashboard

| No | Test Case ID | Test Scenario | Test Case | Pre Condition | Test Step | expected Results | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `TC_DASH_01` | Memuat halaman | Menampilkan elemen utama Dashboard | Berada di Dashboard | 1. Buka halaman Dashboard<br>2. Tunggu proses *fetching* data selesai | Menampilkan Ringkasan Alokasi, Daftar Wilayah Kritis, Peta (Map), dan data user yang login (Nama & Role) | |
| 2 | `TC_DASH_02` | Navigasi menu | Cek menu topbar | Berada di Dashboard | 1. Klik menu "Kelola Data", "Cetak Laporan", atau "Kelola Pengguna" | Sistem mengarahkan user ke halaman komponen yang sesuai (misal: `DataManagement.tsx`) | |
| 3 | `TC_DASH_03` | Integrasi AI | Menjalankan Gemini AI | Berada di Dashboard | 1. Klik tombol hijau "Jalankan Gemini AI (Semua Wilayah)" | Tombol berubah menjadi status progres ("Menganalisis..."). Setelah selesai, muncul popup Alert bahwa analisis selesai dan peta diperbarui | |
| 4 | `TC_DASH_04` | Interaksi Peta | Klik marker pada Peta | Berada di Dashboard | 1. Klik salah satu titik marker pada peta | Muncul panel "Fokus Area" di kiri atas peta yang menampilkan detail kabupaten, status risiko, dan Prediksi Kebutuhan AI | |
| 5 | `TC_DASH_05` | Navigasi Peta | Klik Detail Wilayah | Berada di Dashboard | 1. Klik marker peta<br>2. Klik tombol "LIHAT DETAIL WILAYAH" pada panel Fokus Area | Sistem mengarahkan ke halaman detail wilayah (`CountyDetail.tsx`) untuk kabupaten yang dipilih | |
| 6 | `TC_DASH_06` | Interaksi UI | Cek fitur Notifikasi | Berada di Dashboard | 1. Klik icon Lonceng (Bell) di navbar kanan | Sistem mengarahkan ke halaman histori notifikasi (`NotificationHistory.tsx`) | |
| 7 | `TC_DASH_07` | Keluar aplikasi | Berhasil Logout | Berada di Dashboard | 1. Arahkan kursor (hover) ke kotak profil user di pojok kanan atas<br>2. Klik icon LogOut | Aplikasi memanggil fungsi `onLogout` dan mengembalikan user ke Halaman Login | |
| 8 | `TC_DASH_08` | Error Handling | Gagal memuat data Dashboard | User berhasil login | 1. Matikan backend server sementara<br>2. Refresh / muat ulang halaman dashboard | Tampil halaman error dengan tulisan "Gagal terhubung ke server" beserta icon Segitiga Peringatan dan tombol "Kembali ke Login" | |
