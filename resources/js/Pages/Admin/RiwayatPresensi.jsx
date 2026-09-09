import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';

export default function RiwayatIndex({ riwayat = { data: [] }, pegawai = [], filters = {} }) {
    const { flash } = usePage().props;
    const [filterState, setFilterState] = useState({
        tanggal_mulai: filters.tanggal_mulai || '',
        tanggal_selesai: filters.tanggal_selesai || '',
        pegawai_id: filters.pegawai_id || '',
        status: filters.status || '',
        search: filters.search || '',
    });

    const [selectedDetail, setSelectedDetail] = useState(null);

    const handleFilterChange = (e) => {
        setFilterState({ ...filterState, [e.target.name]: e.target.value });
    };

    const handleApplyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.riwayat.index'), filterState, { preserveState: true });
    };

    const handleResetFilter = () => {
        const resetState = { tanggal_mulai: '', tanggal_selesai: '', pegawai_id: '', status: '', search: '' };
        setFilterState(resetState);
        router.get(route('admin.riwayat.index'), {}, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'hadir':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Hadir</span>;
            case 'terlambat':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">Terlambat</span>;
            case 'izin':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">Izin</span>;
            case 'sakit':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">Sakit</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    const items = riwayat.data || [];

    return (
        <AdminLayout>
            <Head title="Riwayat Presensi" />

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

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Riwayat Presensi</h1>
                    <p className="text-sm text-slate-500 mt-1">Pantau seluruh catatan kehadiran, jam masuk, jam pulang, dan lokasi pegawai.</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6">
                <form onSubmit={handleApplyFilter} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cari Pegawai / NRG</label>
                        <input
                            type="text"
                            name="search"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            placeholder="Nama atau NRG..."
                            value={filterState.search}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            name="tanggal_mulai"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={filterState.tanggal_mulai}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tanggal Selesai</label>
                        <input
                            type="date"
                            name="tanggal_selesai"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={filterState.tanggal_selesai}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Pegawai</label>
                        <select
                            name="pegawai_id"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={filterState.pegawai_id}
                            onChange={handleFilterChange}
                        >
                            <option value="">Semua Pegawai</option>
                            {pegawai.map((item) => (
                                <option key={item.id} value={item.id}>{item.nama} - {item.nrg}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status Absen</label>
                        <select
                            name="status"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            value={filterState.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">Semua Status</option>
                            <option value="Hadir">Hadir</option>
                            <option value="Terlambat">Terlambat</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
                        >
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Table Riwayat */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="py-4 px-6">Pegawai</th>
                                <th className="py-4 px-6">Tanggal</th>
                                <th className="py-4 px-6">Jam Masuk</th>
                                <th className="py-4 px-6">Jam Pulang</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-bold text-slate-900">{item.pegawai?.nama}</p>
                                                <p className="text-xs text-slate-400">{item.pegawai?.nrg} - {item.pegawai?.jabatan?.jabatan || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">{item.tanggal}</td>
                                        <td className="py-4 px-6 text-emerald-600 font-semibold">{item.jam_masuk || '-'}</td>
                                        <td className="py-4 px-6 text-rose-600 font-semibold">{item.jam_pulang || '-'}</td>
                                        <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => setSelectedDetail(item)}
                                                className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                            >
                                                Detail GPS & Foto
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                                        Tidak ada catatan riwayat presensi ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {riwayat.links && riwayat.links.length > 3 && (
                    <nav className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4" aria-label="Pagination Riwayat">
                        <span className="text-xs text-slate-500">
                            Menampilkan {riwayat.from || 0}-{riwayat.to || 0} dari {riwayat.total || 0} riwayat
                        </span>
                        <div className="flex flex-wrap justify-end gap-2">
                            {riwayat.links.map((link, index) => (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${link.active ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40'}`}
                                >
                                    {link.label.replace('&laquo;', '<').replace('&raquo;', '>')}
                                </button>
                            ))}
                        </div>
                    </nav>
                )}
            </div>

            {/* MODAL DETAIL PRESENSI */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Detail Presensi Pegawai</h3>
                            <button onClick={() => setSelectedDetail(null)} className="text-slate-400 font-bold">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                                <div>
                                    <p className="font-bold text-slate-900">{selectedDetail.pegawai?.nama}</p>
                                    <p className="text-xs text-slate-400">Tanggal: {selectedDetail.tanggal}</p>
                                </div>
                            </div>

                            {/* Foto Absen jika ada */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-500 mb-2">Foto Masuk</p>
                                    {selectedDetail.foto_masuk ? (
                                        <img src={selectedDetail.foto_masuk} className="w-full h-32 object-cover rounded-2xl border" alt="Foto Masuk" />
                                    ) : (
                                        <div className="w-full h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">Tidak Ada Foto</div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-500 mb-2">Foto Pulang</p>
                                    {selectedDetail.foto_pulang ? (
                                        <img src={selectedDetail.foto_pulang} className="w-full h-32 object-cover rounded-2xl border" alt="Foto Pulang" />
                                    ) : (
                                        <div className="w-full h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">Tidak Ada Foto</div>
                                    )}
                                </div>
                            </div>

                            {/* Koordinat GPS & Jarak */}
                            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Lokasi Masuk (Lat, Long):</span>
                                    <span className="font-bold text-slate-700">
                                        {Array.isArray(selectedDetail.lokasi_masuk)
                                            ? selectedDetail.lokasi_masuk.join(', ')
                                            : (selectedDetail.lokasi_masuk || '-')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Jarak saat Absen:</span>
                                    <span className="font-bold text-blue-600">
                                        {selectedDetail.jarak_meter ? `${selectedDetail.jarak_meter} Meter` : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 text-right">
                                <button
                                    onClick={() => setSelectedDetail(null)}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}