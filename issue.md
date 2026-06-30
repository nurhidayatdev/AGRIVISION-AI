# Laporan Isu: Responsivitas Antarmuka Pengguna (UI) - AgriVision AI

Dokumen ini mencatat beberapa temuan terkait masalah responsivitas tampilan (responsive design) pada aplikasi AgriVision AI. Aplikasi ini banyak digunakan oleh Admin Provinsi, Admin Kabupaten, dan Petugas Penyuluh Lapangan (PPL) yang sering mengakses sistem dari perangkat seluler (smartphone) atau tablet di lapangan. Oleh karena itu, optimasi tampilan mobile sangat krusial.

---

## 1. Ringkasan Temuan Masalah

Secara umum, layout saat ini dirancang dengan pendekatan *Desktop-First* yang menggunakan lebar statis atau pembatas kaku (`overflow-hidden`, flexbox horizontal tanpa wrap), yang menyebabkan antarmuka pecah atau terpotong pada layar di bawah 1024 piksel.

| Komponen | Deskripsi Masalah | Dampak Pengguna | File Terkait |
| :--- | :--- | :--- | :--- |
| **Navbar** | Navigasi menu utama bertumpuk secara horizontal tanpa adanya *Mobile Hamburger Menu*. Informasi tanggal & profil pengguna terpotong di layar kecil. | Pengguna mobile tidak bisa mengakses menu "Kelola Data" atau "Kelola Pengguna". | `src/components/Navbar.tsx` |
| **Dashboard Layout** | `main` menggunakan `flex gap-6` horizontal kaku dengan `overflow-hidden` pada elemen utama. Sidebar ringkasan (300px) mendesak peta hingga sangat sempit. | Halaman tidak dapat di-scroll secara vertikal; peta menjadi tidak terbaca dan tidak bisa digunakan. | `src/components/Dashboard.tsx` |
| **Peta & Overlay Panel** | Panel detail wilayah kritis (`absolute top-6 left-6 w-[300px]`) melayang di atas peta dan menutupi hampir 80% area peta pada resolusi mobile. | Pengguna kesulitan menyentuh pin lokasi atau menggeser peta karena terhalang panel detail. | `src/components/Dashboard.tsx` |
| **Filter Panel** | Panel pencarian dan filter di halaman Kelola Data & Pengguna menggunakan layout horizontal (`flex gap-4 items-end`) tanpa wrap. | Input pencarian menyusut drastis dan tombol filter keluar dari batas layar (horizontal overflow). | `src/components/DataManagement.tsx`<br>`src/components/UserManagement.tsx` |

---

## 2. Rincian Isu & Analisis Kode

### A. Navbar
Berkas: [Navbar.tsx](file:///c:/xampp/htdocs/AGRIVISION-AI/src/components/Navbar.tsx)
```tsx
// Baris 30:
<nav className="bg-[#023E2D] text-white flex items-center justify-between pl-6 pr-4 h-[64px] shrink-0">
  <div className="flex items-center h-full">
    {/* Navigasi menu bertumpuk secara horizontal langsung */}
    <div className="flex items-center h-full text-[15px] font-medium ml-4">
      <button onClick={() => onNavigate('dashboard')} ...>Dashboard</button>
      {/* ... tombol lainnya ... */}
    </div>
  </div>
</nav>
```
*   **Analisis**: Tidak ada penanganan breakpoint. Di layar dengan lebar < 768px, navigasi ini akan bertabrakan dengan info profil pengguna di sebelah kanan.
*   **Rekomendasi**: 
    *   Sembunyikan menu link pada layar kecil (`hidden md:flex`).
    *   Tambahkan tombol hamburger menu (`Menu` & `X` dari lucide-react) yang hanya muncul di layar kecil (`block md:hidden`).
    *   Tampilkan menu dropdown vertikal (drawer/collapsible) ketika hamburger menu diklik.

### B. Layout Utama Dashboard
Berkas: [Dashboard.tsx](file:///c:/xampp/htdocs/AGRIVISION-AI/src/components/Dashboard.tsx)
```tsx
// Baris 384:
<main className="flex-1 p-6 flex gap-6 overflow-hidden">
  {/* Left Sidebar */}
  <div className="w-[300px] flex flex-col gap-6 shrink-0 overflow-y-auto ...">
    {/* ... */}
  </div>
  {/* Right Main Area */}
  <div className="flex-1 flex flex-col gap-6 overflow-hidden">
    {/* ... */}
  </div>
</main>
```
*   **Analisis**: Penggunaan `flex` tanpa `flex-wrap` dan `w-[300px] shrink-0` pada sidebar memaksa sidebar tetap berukuran 300px, menyisakan ruang yang sangat sempit untuk peta di sebelahnya. `overflow-hidden` di main content mencegah pengguna melakukan scroll halaman ke bawah pada perangkat seluler.
*   **Rekomendasi**:
    *   Ubah layout main menjadi responsif: `flex-col lg:flex-row`.
    *   Pada layar kecil, sidebar ringkasan alokasi diposisikan di atas peta dan lebarnya dibuat penuh (`w-full lg:w-[300px]`).
    *   Ubah `overflow-hidden` pada main container menjadi `overflow-y-auto` di bawah breakpoint `lg:`.

### C. Panel Detail Wilayah di Atas Peta
Berkas: [Dashboard.tsx](file:///c:/xampp/htdocs/AGRIVISION-AI/src/components/Dashboard.tsx)
```tsx
// Baris 501:
{activeFocusArea && (
  <div className="absolute top-6 left-6 w-[300px] bg-white rounded-md shadow-... z-10 border border-gray-100 overflow-hidden">
    {/* ... info detail wilayah ... */}
  </div>
)}
```
*   **Analisis**: Posisi `absolute top-6 left-6` sangat baik di desktop. Namun, pada mobile, panel berlebar `300px` ini akan memblokir hampir seluruh interaksi dengan peta Leaflet.
*   **Rekomendasi**:
    *   Ubah posisi panel detail di mobile menjadi *bottom sheet* (melayang di bagian bawah layar) atau collapsible panel yang dapat disembunyikan.
    *   Gunakan kelas responsive Tailwind seperti: `absolute bottom-4 left-4 right-4 md:top-6 md:left-6 md:bottom-auto md:w-[300px]`.

### D. Panel Filter & Manajemen Data
Berkas: [DataManagement.tsx](file:///c:/xampp/htdocs/AGRIVISION-AI/src/components/DataManagement.tsx)
```tsx
// Baris 163:
<div className="bg-white rounded-md border border-gray-200 ... p-5 flex gap-4 items-end">
  <div className="flex-1 space-y-1.5">...Pencarian...</div>
  <div className="w-[280px] space-y-1.5">...Bulan...</div>
  <div className="w-[280px] space-y-1.5">...Status...</div>
  <button className="h-[38px] ...">Filter</button>
</div>
```
*   **Analisis**: `flex gap-4 items-end` memaksa semua kolom input sejajar ke samping. Di perangkat dengan lebar < 1024px, dropdown bulan dan status yang masing-masing berlebar `280px` akan memotong input pencarian atau terdorong keluar layar.
*   **Rekomendasi**:
    *   Ubah layout filter menjadi grid responsif: `grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-end gap-4`.
    *   Sesuaikan lebar dropdown agar responsif (`w-full lg:w-[280px]`).

---

## 3. Rencana Tindakan Perbaikan (Remediation Checklist)

- [ ] **Navbar Responsif**
  - [ ] Implementasi hamburger button menu untuk layar `< md`.
  - [ ] Sembunyikan profil detail (nama/role) di mobile, ganti dengan avatar minimalis / satukan di dalam menu hamburger dropdown.
  - [ ] Buat menu navigasi vertikal slide-out (drawer) untuk seluler.
- [ ] **Dashboard Layout Grid**
  - [ ] Modifikasi `main` agar menggunakan `flex-col lg:flex-row`.
  - [ ] Atur ulang min-height dan perilaku scroll agar bersahabat dengan sentuhan jari (touch-friendly).
- [ ] **Panel Info Peta Seluler**
  - [ ] Deteksi resolusi mobile atau gunakan CSS breakpoint untuk mengubah posisi detail wilayah aktif ke bawah peta.
- [ ] **Filter Form Grid**
  - [ ] Terapkan grid responsif pada seluruh panel filter di `DataManagement.tsx` dan `UserManagement.tsx`.
- [ ] **Validasi Pengujian**
  - [ ] Uji responsivitas di Chrome DevTools menggunakan simulasi perangkat iPhone SE (375px), iPhone 12/13 Pro (390px), dan iPad (768px).

---
*Dokumen ini dibuat secara otomatis sebagai panduan kerja perbaikan UI/UX AgriVision AI.*
