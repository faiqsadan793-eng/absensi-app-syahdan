import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function JabatanIndex({ jabatan = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        jabatan: '',
    });

    const openModalCreate = () => {
        setEditItem(null);
        reset();
        setIsModalOpen(true);
    };

    const openModalEdit = (item) => {
        setEditItem(item);
        setData('jabatan', item.jabatan);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editItem) {
            put(route('admin.jabatan.update', editItem.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.jabatan.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, namaJabatan) => {
        if (confirm(`Apakah Anda yakin ingin menghapus jabatan "${namaJabatan}"?`)) {
            router.delete(route('admin.jabatan.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Data Jabatan" />

            {/* Header Page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Jabatan</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola posisi dan struktur struktur posisi pegawai di perusahaan.</p>
                </div>
                <button
                    onClick={openModalCreate}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200"
                >
                    <span className="text-lg leading-none">+</span>
                    <span>Tambah Jabatan</span>
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden max-w-4xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="py-4 px-6">Nama Jabatan</th>
                                <th className="py-4 px-6">Jumlah Pegawai</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {jabatan.length > 0 ? (
                                jabatan.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm border border-indigo-100">
                                                    💼
                                                </div>
                                                <span className="font-bold text-slate-900">{item.jabatan}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                                                {item.pegawai_count || 0} Pegawai
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <button
                                                onClick={() => openModalEdit(item)}
                                                className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.jabatan)}
                                                className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-12 text-center text-slate-400 text-sm">
                                        Belum ada data jabatan. Klik <strong>+ Tambah Jabatan</strong> untuk menambahkan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM (TAMBAH / EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editItem ? 'Edit Nama Jabatan' : 'Tambah Jabatan Baru'}
                                </h3>
                                <p className="text-xs text-slate-400">Masukkan nama posisi/jabatan pegawai.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Jabatan</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    placeholder="Contoh: Frontend Developer, HRD, Supervisor"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    autoFocus
                                    required
                                />
                                {errors.jabatan && <span className="text-xs text-rose-500 mt-1">{errors.jabatan}</span>}
                            </div>

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
                                    {processing ? 'Menyimpan...' : editItem ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}