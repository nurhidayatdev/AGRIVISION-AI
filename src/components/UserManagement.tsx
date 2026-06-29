import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Navbar from './Navbar';
import bcrypt from 'bcryptjs';
import logo from '../assets/logo_agrivision_ai.png';
import {
  Bell,
  User,
  ChevronRight,
  LogOut,
  Search,
  ChevronDown,
  Plus,
  X,
  Trash2,
  Edit2
} from 'lucide-react';

export default function UserManagement({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: string) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [kabupatens, setKabupatens] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [nip, setNip] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState('');
  const [idKabupaten, setIdKabupaten] = useState('');
  const [password, setPassword] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Role');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          master_kabupaten (nama_kabupaten)
        `)
        .order('id_user', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
      } else if (data) {
        const formattedData = data.map((u: any) => ({
          ...u,
          nama_kabupaten: u.master_kabupaten?.nama_kabupaten || 'Semua Kabupaten (Provinsi)'
        }));
        setUsers(formattedData);
      }
      
      // Ambil user dari localStorage untuk currentUser
      const sessionStr = localStorage.getItem('agrivision_session');
      if (sessionStr) setCurrentUser(JSON.parse(sessionStr));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKabupaten = async () => {
    try {
      const { data, error } = await supabase.from('master_kabupaten').select('*').order('nama_kabupaten');
      if (data) setKabupatens(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchKabupaten();
  }, []);

  const [editId, setEditId] = useState<number | null>(null);

  const openAddModal = () => {
    setEditId(null);
    setNip(''); setNamaLengkap(''); setRole(''); setIdKabupaten(''); setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditId(user.id_user);
    setNip(user.nip);
    setNamaLengkap(user.nama_lengkap);
    setRole(user.role);
    setIdKabupaten(user.id_kabupaten ? user.id_kabupaten.toString() : '');
    setPassword(''); // leave empty to not change
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id_user', id);
      if (error) alert("Gagal menghapus: " + error.message);
      else fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let hash = null;
      if (password) {
        hash = bcrypt.hashSync(password, 10);
      }

      if (editId) {
        // Update
        const payload: any = {
          nip,
          nama_lengkap: namaLengkap,
          role,
          id_kabupaten: idKabupaten || null,
        };
        if (hash) payload.password_hash = hash;

        const { error } = await supabase.from('users').update(payload).eq('id_user', editId);
        if (error) alert("Gagal update ke Supabase: " + error.message);
        else {
          setIsModalOpen(false);
          fetchUsers();
        }
      } else {
        // Insert
        if (!password) {
          alert('Password wajib diisi untuk pengguna baru!');
          return;
        }
        const { error } = await supabase.from('users').insert([{
          nip,
          nama_lengkap: namaLengkap,
          role,
          id_kabupaten: idKabupaten || null,
          password_hash: hash
        }]);

        if (error) {
          alert("Gagal menyimpan ke Supabase: " + error.message);
        } else {
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengguna');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.nip.includes(searchQuery);
    const matchRole = roleFilter === 'Semua Role' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans relative">
      <Navbar onNavigate={onNavigate} onLogout={onLogout} activePage="users" />

      {/* Breadcrumb Bar */}
      <div className="bg-white px-6 py-4 shrink-0 border-b border-gray-200">
        <div className="flex items-center text-[13px] font-medium text-gray-500 gap-2 mb-2">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-gray-900 cursor-pointer transition-colors">Beranda</button>
          <span className="text-gray-400">›</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Pengaturan</span>
          <span className="text-gray-400">›</span>
          <span className="text-[#113224] font-bold">Kelola Pengguna</span>
        </div>
        <h1 className="text-[22px] font-extrabold text-[#113224] tracking-tight">Daftar Akun Pengguna Sistem</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Filter and Action Bar */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIP..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D] text-gray-700 placeholder-gray-400" 
              />
            </div>

            <div className="relative w-[180px]">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 appearance-none bg-white focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]"
              >
                <option value="Semua Role">Semua Role</option>
                <option value="Admin Provinsi">Admin Provinsi</option>
                <option value="Admin Kabupaten">Admin Kabupaten</option>
                <option value="PPL">PPL</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={16} strokeWidth={2} />
              </div>
            </div>
          </div>

          <button onClick={openAddModal} className="bg-[#022C22] hover:bg-[#042f2e] text-white font-bold px-4 py-2.5 rounded-sm flex items-center gap-2 transition-colors text-[13px] shadow-sm tracking-wide">
            <Plus size={16} strokeWidth={2.5} />
            Tambah Pengguna Baru
          </button>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[5%]">No</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">NIP</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Nama Lengkap</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Role</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Kabupaten/Instansi</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[10%]">Status Akun</th>
                  <th className="py-4 px-6 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right w-[10%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-700">
                {filteredUsers.length > 0 ? filteredUsers.map((u, index) => {
                  const roleClass = (u.role === 'Admin Pusat' || u.role === 'Admin Provinsi' || u.role === 'Super Admin Provinsi')
                    ? 'bg-[#1e3a33] text-white border-[#1e3a33]'
                    : (u.role === 'PPL' ? 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]' : 'bg-gray-200 text-gray-600 border-gray-300');
                  
                  return (
                    <tr key={u.id_user || index} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                      <td className="py-5 px-6">{index + 1}</td>
                      <td className="py-5 px-6 font-mono font-bold tracking-tight text-gray-600">{u.nip}</td>
                      <td className="py-5 px-6 font-bold text-gray-900">{u.nama_lengkap}</td>
                      <td className="py-5 px-6">
                        <span className={`${roleClass} inline-block whitespace-nowrap px-2.5 py-1 rounded-sm text-[11px] font-medium border`}>{u.role}</span>
                      </td>
                      <td className="py-5 px-6">{u.nama_kabupaten || 'Provinsi / Pusat'}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[12px]">
                          <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Aktif
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEditModal(u)} className="text-[#006B4D] hover:text-[#004D36] transition-colors"><Edit2 size={16}/></button>
                          <button onClick={() => handleDeleteUser(u.id_user)} className="text-[#DC2626] hover:text-red-800 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center text-gray-500">Belum ada data pengguna.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-[13px] text-gray-500 bg-white rounded-b-md">
            <div>Menampilkan <span className="font-bold text-gray-700">{filteredUsers.length}</span> data</div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#113224] tracking-tight">{editId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="p-6 flex flex-col gap-5">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#113224]">NIP</label>
                  <input type="text" value={nip} onChange={e => setNip(e.target.value)} required placeholder="Masukkan Nomor Induk Pegawai" className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#113224]">Nama Lengkap</label>
                  <input type="text" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} required placeholder="Beserta gelar akademik" className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#113224]">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                    <option value="">Pilih Role Sistem</option>
                    <option value="Admin Provinsi">Admin Provinsi</option>
                    <option value="Admin Kabupaten">Admin Kabupaten</option>
                    <option value="PPL">PPL</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#113224]">Kabupaten/Instansi</label>
                  <select value={idKabupaten} onChange={e => setIdKabupaten(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]">
                    <option value="">(Provinsi / Pusat)</option>
                    {kabupatens.map(kab => (
                      <option key={kab.id} value={kab.id}>{kab.nama_kabupaten}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#113224]">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 karakter" className="w-full px-3 py-2.5 border border-gray-200 rounded-sm text-[13px] focus:outline-none focus:border-[#006B4D] focus:ring-1 focus:ring-[#006B4D]" />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold text-[13px] rounded-sm hover:bg-gray-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-[#022C22] hover:bg-[#042f2e] text-white font-bold text-[13px] rounded-sm transition-colors shadow-sm">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
