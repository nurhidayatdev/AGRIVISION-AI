<div align="center">
  <img src="https://raw.githubusercontent.com/nurhidayatdev/AGRIVISION-AI/main/assets/logo_agrivision_ai.png" alt="AgriVision AI Logo" width="80" />
  <h1>AgriVision AI</h1>
  <p><strong>Sistem Command Center Prediksi & Alokasi Pupuk Bersubsidi</strong></p>
  <p>Provinsi Sulawesi Selatan — berbasis AI, data cuaca BMKG, dan e-RDKK</p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
    <img src="https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=flat-square&logo=google" />
  </p>
</div>

---

## 📌 Tentang Proyek

**AgriVision AI** adalah sistem informasi berbasis web untuk memantau, memprediksi, dan mengelola alokasi pupuk bersubsidi di seluruh kabupaten/kota Provinsi Sulawesi Selatan secara real-time.

Sistem ini mengintegrasikan:
- 🤖 **Gemini AI** — analisis prediktif & narasi rekomendasi otomatis
- 🌤️ **Data cuaca BMKG** — deteksi anomali cuaca (La Niña, hujan ekstrem)
- 🗺️ **Leaflet.js** — peta interaktif status risiko per kabupaten
- 🔄 **Supabase Realtime** — sinkronisasi data langsung tanpa refresh

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Dashboard Command Center** | Peta interaktif, ringkasan alokasi, dan wilayah kritis secara real-time |
| 🤖 **Analisis Gemini AI** | Prediksi kebutuhan urea & NPK berdasarkan data cuaca BMKG |
| 📋 **Kelola Data** | Tabel alokasi e-RDKK per kabupaten dengan filter & pencarian |
| 📥 **Import Excel/BPS** | Upload data dari file Excel atau laporan BPS |
| 🖨️ **Cetak Laporan PDF** | Generator laporan eksekutif siap cetak dengan e-Sign digital |
| 🔔 **Notifikasi Alert** | Riwayat peringatan otomatis untuk wilayah defisit |
| 👥 **Kelola Pengguna** | Manajemen akun dengan role: Admin Provinsi, Admin Kabupaten, PPL |
| 📱 **Responsif** | Tampilan optimal di desktop, tablet, dan mobile |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) v18 atau lebih baru
- Akun [Supabase](https://supabase.com/) (untuk database)
- API Key [Google Gemini](https://ai.google.dev/)

### Langkah Instalasi

**1. Clone repositori**
```bash
git clone https://github.com/nurhidayatdev/AGRIVISION-AI.git
cd AGRIVISION-AI
```

**2. Install dependencies**
```bash
npm install
```

**3. Konfigurasi environment**

Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi variabel berikut di file `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**4. Jalankan aplikasi**
```bash
npm run dev
```

Akses di browser: **http://localhost:3000**

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | React 19, TypeScript 5.8 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4, Plus Jakarta Sans |
| Database | Supabase (PostgreSQL) + Realtime |
| AI | Google Gemini 1.5 Flash |
| Peta | Leaflet.js (via CDN) |
| Icons | Lucide React |
| Auth | bcryptjs (hash password) |

---

## 📁 Struktur Proyek

```
AGRIVISION-AI/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigasi responsif dengan hamburger menu
│   │   ├── Dashboard.tsx        # Command center + peta Leaflet
│   │   ├── DataManagement.tsx   # Tabel data alokasi e-RDKK
│   │   ├── ImportData.tsx       # Upload Excel/BPS
│   │   ├── ReportGenerator.tsx  # Generator laporan PDF
│   │   ├── CountyDetail.tsx     # Detail per kabupaten
│   │   ├── NotificationHistory.tsx  # Riwayat alert
│   │   └── UserManagement.tsx   # Manajemen pengguna
│   ├── utils/
│   │   └── supabaseClient.ts    # Konfigurasi Supabase
│   ├── assets/                  # Logo dan gambar
│   ├── App.tsx                  # Router utama
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles (Tailwind v4)
│   └── vite-env.d.ts            # Type declarations
├── .env.example                 # Template environment variables
├── supabase_migration.sql       # Skema database Supabase
├── vite.config.ts
└── tsconfig.json
```

---

## 🗄️ Setup Database

Jalankan file migrasi untuk membuat skema database di Supabase:

1. Buka **Supabase Dashboard** → SQL Editor
2. Paste isi file `supabase_migration.sql`
3. Klik **Run**

---

## 👤 Akun Default (Testing)

| NIP | Password | Role |
|-----|----------|------|
| *(lihat database)* | `Admin123!` | Admin Provinsi |

> ⚠️ Ganti password default setelah pertama kali login di lingkungan produksi.

---

## 📜 Lisensi

Proyek ini dikembangkan untuk keperluan **GovTech Dinas Pertanian Provinsi Sulawesi Selatan**.  
© 2026 AgriVision AI — Restricted Government Access Only.
