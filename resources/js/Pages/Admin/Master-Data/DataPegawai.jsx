import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function PegawaiIndex({ pegawai = { data: [] }, jabatan = [], lokasi = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nrg: '',
        nama: '',
        jenis_kelamin: 'Laki-Laki',
        alamat: '',
        no_handphone: '',
        id_jabatan: '',
        lokasi_presensi_id: '',
        username: '',
        password: '',
        status: 'aktif',
    });

    const openModalCreate = () => {
        setEditItem(null);
        clearErrors();
        reset();
        setData({
            nrg: '',
            nama: '',
            jenis_kelamin: 'Laki-Laki',
            alamat: '',
            no_handphone: '',
            id_jabatan: '',
            lokasi_presensi_id: '',
            username: '',
            password: '',
            status: 'aktif',
        });
        setIsModalOpen(true);
    };

    const openModalEdit = (item) => {
        setEditItem(item);
        clearErrors();
        setData({
            nrg: item.nrg || '',
            nama: item.nama || '',
            jenis_kelamin: item.jenis_kelamin || 'Laki-Laki',
            alamat: item.alamat || '',
            no_handphone: item.no_handphone || '',
            id_jabatan: item.id_jabatan || '',
            lokasi_presensi_id: item.lokasi_presensi_id || '',
            username: item.user?.username || '',
            password: '',
            status: item.user?.status || 'aktif',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editItem) {
            put(route('admin.pegawai.update', editItem.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.pegawai.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, nama) => {
        if (confirm(`Apakah kamu yakin ingin menghapus data pegawai "${nama}"?`)) {
            router.delete(route('admin.pegawai.destroy', { pegawai: id }));
        }
    };

    const items = Array.isArray(pegawai) ? pegawai : (pegawai.data || []);

    return (
        <AdminLayout>
            <Head title="Kelola Data Pegawai" />

            {/* Flash Messages */}
            {flash?.success && (
                <div role="alert" className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                    <span>✓</span>
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div role="alert" className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                    <span>⚠</span>
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Header Page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Pegawai</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola seluruh informasi akun, posisi, dan profil pegawai perusahaan.</p>
                </div>
                <button
                    onClick={openModalCreate}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200"
                >
                    <span className="text-lg leading-none">+</span>
                    <span>Tambah Pegawai</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="py-4 px-6">Pegawai</th>
                                <th className="py-4 px-6">NRG</th>
                                <th className="py-4 px-6">Jabatan</th>
                                <th className="py-4 px-6">Kontak</th>
                                <th className="py-4 px-6">Lokasi</th>
                                <th className="py-4 px-6">Status Akun</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                                                    {item.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{item.nama}</p>
                                                    <p className="text-xs text-slate-400">@{item.user?.username || 'no-username'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">{item.nrg}</td>
                                        <td className="py-4 px-6">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                                                {item.jabatan?.jabatan || 'Tidak ada'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-xs font-medium text-slate-800">{item.no_handphone}</p>
                                            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{item.alamat}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                📍 {item.lokasi_presensi?.nama_lokasi || 'Belum diatur'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                item.user?.status === 'aktif'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.user?.status === 'aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {item.user?.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-1">
                                            <button
                                                onClick={() => openModalEdit(item)}
                                                className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-bold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.nama)}
                                                className="px-3 py-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                                        Belum ada data pegawai. Klik <strong>+ Tambah Pegawai</strong> untuk menambahkan data baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pegawai.links && pegawai.links.length > 3 && (
                    <nav className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4" aria-label="Pagination Pegawai">
                        <span className="text-xs text-slate-500">
                            Menampilkan {pegawai.from || 0}-{pegawai.to || 0} dari {pegawai.total || 0} pegawai
                        </span>
                        <div className="flex flex-wrap justify-end gap-2">
                            {pegawai.links.map((link, index) => (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    disabled={!link.url || link.active || processing}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${link.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40'}`}
                                >
                                    {link.label.replace('&laquo;', '<').replace('&raquo;', '>')}
                                </button>
                            ))}
                        </div>
                    </nav>
                )}
            </div>

            {/* MODAL TAMBAH / EDIT PEGAWAI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editItem ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {editItem ? 'Perbarui data profil dan status akun pegawai.' : 'Isi seluruh data profil dan pembuatan akun login pegawai.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">NRG (Nomor Registrasi)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        placeholder="Contoh: PGW-2026-001"
                                        value={data.nrg}
                                        onChange={(e) => setData('nrg', e.target.value)}
                                        required
                                    />
                                    {errors.nrg && <span className="text-xs text-rose-500 mt-1">{errors.nrg}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        placeholder="Masukkan nama pegawai"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                    />
                                    {errors.nama && <span className="text-xs text-rose-500 mt-1">{errors.nama}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jenis Kelamin</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="Laki-Laki">Laki-Laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jabatan</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        value={data.id_jabatan}
                                        onChange={(e) => setData('id_jabatan', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Jabatan --</option>
                                        {jabatan.map((j) => (
                                            <option key={j.id} value={j.id}>
                                                {j.jabatan}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_jabatan && <span className="text-xs text-rose-500 mt-1">{errors.id_jabatan}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">No. Handphone</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        placeholder="08xxxxxxxxxx"
                                        value={data.no_handphone}
                                        onChange={(e) => setData('no_handphone', e.target.value)}
                                        required
                                    />
                                    {errors.no_handphone && <span className="text-xs text-rose-500 mt-1">{errors.no_handphone}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Penempatan Lokasi</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        value={data.lokasi_presensi_id}
                                        onChange={(e) => setData('lokasi_presensi_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Lokasi --</option>
                                        {lokasi.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.nama_lokasi}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.lokasi_presensi_id && <span className="text-xs text-rose-500 mt-1">{errors.lokasi_presensi_id}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Alamat Lengkap</label>
                                <textarea
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    rows="2"
                                    placeholder="Alamat domisili"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    required
                                ></textarea>
                                {errors.alamat && <span className="text-xs text-rose-500 mt-1">{errors.alamat}</span>}
                            </div>

                            <hr className="my-2 border-slate-100" />
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Kredensial & Status Akun</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Username</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        placeholder="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required
                                    />
                                    {errors.username && <span className="text-xs text-rose-500 mt-1">{errors.username}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                                        Password {editItem && '(Kosongkan jika tidak diubah)'}
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        placeholder={editItem ? '••••••••' : 'Password baru'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        {...(!editItem ? { required: true } : {})}
                                    />
                                    {errors.password && <span className="text-xs text-rose-500 mt-1">{errors.password}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status Akun</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif (Blokir Akses)</option>
                                    </select>
                                    {errors.status && <span className="text-xs text-rose-500 mt-1">{errors.status}</span>}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : editItem ? 'Perbarui Pegawai' : 'Simpan Pegawai'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}