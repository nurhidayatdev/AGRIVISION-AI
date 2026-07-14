export interface UserSession {
  id: string;
  nama_lengkap: string;
  role: string;
  nomor_wa?: string;
  id_kabupaten?: number;
  nama_kabupaten?: string;
  nama_kecamatan?: string;
  is_provinsi_admin?: boolean;
}

export interface MasterKabupaten {
  id_kabupaten?: number;
  nama_kabupaten: string;
  koordinat_lat?: number | string;
  koordinat_lng?: number | string;
  kode_bps?: string;
}

export interface AlokasiPupuk {
  id_alokasi: number;
  id_kabupaten: number;
  musim_tanam: string;
  tahun: number;
  luas_lahan: number;
  komoditas: string;
  kuota_urea: number;
  kuota_npk: number;
  prediksi_urea: number;
  prediksi_npk: number;
  status_risiko: string;
  narasi_rekomendasi?: string;
  cuaca_anomali?: string;
  last_analyzed_at?: string;
  master_kabupaten?: MasterKabupaten | MasterKabupaten[];
}

export interface MapData extends AlokasiPupuk {
  nama_kabupaten?: string;
  koordinat_lat?: number | string;
  koordinat_lng?: number | string;
  kode_bps?: string;
}

export interface DashboardData {
  totals: {
    lahan: number;
    urea: number;
    npk: number;
  };
  kritis_data: MapData[];
  map_data: MapData[];
  user: UserSession;
}

export interface LaporanPpl {
  id_laporan: number;
  id_kabupaten: number;
  id_user?: string;
  nama_kecamatan: string;
  kondisi_lahan: string;
  usulan_tambahan_urea: number;
  catatan_lapangan: string;
  created_at: string;
}

export interface NotificationLog {
  id?: number;
  id_kabupaten: number;
  nama_kabupaten?: string;
  dikirim_pada: string;
  pesan_ai: string;
  status_tindakan: string;
  master_kabupaten?: MasterKabupaten;
  waktu_tindakan?: string;
}

export interface UserAccount {
  id_user?: number;
  id?: string;
  nip: string;
  nama_lengkap: string;
  role: string;
  nomor_wa?: string;
  id_kabupaten?: number;
  nama_kecamatan?: string;
  email?: string;
  password_hash?: string;
  nama_kabupaten?: string;
}
