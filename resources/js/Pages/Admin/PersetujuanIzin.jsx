import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function PersetujuanIzinIndex({ pengajuan = { data: [] }, filters = {} }) {
    const { flash } = usePage().props;
    const [selectedIzin, setSelectedIzin] = useState(null);
    const [actionType, setActionType] = useState(''); // 'disetujui' atau 'ditolak'

    const { data, setData, put, processing, reset } = useForm({
        status: '',
        catatan_admin: '',
    });

    const handleOpenModal = (item, type) => {
        setSelectedIzin(item);
        setActionType(type);
        setData({
            status: type,
            catatan_admin: '',
        });
    };

    const handleSubmitAction = (e) => {
        e.preventDefault();
        put(route('admin.izin.update-status', selectedIzin.id), {
            onSuccess: () => {
                setSelectedIzin(null);
                reset();
            },
        });
    };

    const handleFilterStatus = (status) => {
        router.get(route('admin.izin.index'), { status }, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'disetujui':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Disetujui</span>;
            case 'ditolak':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">Ditolak</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">Menunggu Konfirmasi</span>;
        }
    };

    const items = pengajuan.data || [];

    return (
        <AdminLayout>
            <Head title="Persetujuan Izin & Sakit" />

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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Persetujuan Izin & Sakit</h1>
                    <p className="text-sm text-slate-500 mt-1">Verifikasi pengajuan tidak masuk kerja dari pegawai beserta bukti pendukung.</p>
                </div>

                {/* Filter Status Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
                    <button
                        onClick={() => handleFilterStatus('')}
                        className={`px-4 py-2 rounded-xl transition-all ${!filters.status ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => handleFilterStatus('pending')}
                        className={`px-4 py-2 rounded-xl transition-all ${filters.status === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => handleFilterStatus('disetujui')}
                        className={`px-4 py-2 rounded-xl transition-all ${filters.status === 'disetujui' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                        Disetujui
                    </button>
                    <button
                        onClick={() => handleFilterStatus('ditolak')}
                        className={`px-4 py-2 rounded-xl transition-all ${filters.status === 'ditolak' ? 'bg-white text-rose-600 shadow-sm' : 'hover:text-slate-900'}`}
                    >
                        Ditolak
                    </button>
                </div>
            </div>

            {/* Table Pengajuan */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="py-4 px-6">Pegawai</th>
                                <th className="py-4 px-6">Kategori</th>
                                <th className="py-4 px-6">Tanggal</th>
                                <th className="py-4 px-6">Alasan</th>
                                <th className="py-4 px-6">Bukti Surat</th>
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
                                                <p className="text-xs text-slate-400">{item.pegawai?.jabatan?.jabatan || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                                item.kategori === 'sakit' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-slate-800">{item.tanggal}</td>
                                        <td className="py-4 px-6 max-w-xs truncate text-xs text-slate-500">{item.alasan}</td>
                                        <td className="py-4 px-6">
                                            {item.bukti_file ? (
                                                <a
                                                    href={item.bukti_file}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                                                >
                                                    📄 Lihat Bukti
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                                        <td className="py-4 px-6 text-right">
                                            {item.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(item, 'disetujui')}
                                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(item, 'ditolak')}
                                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                                        Tidak ada data pengajuan izin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pengajuan.links && pengajuan.links.length > 3 && (
                    <nav className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4" aria-label="Pagination Pengajuan">
                        <span className="text-xs text-slate-500">
                            Menampilkan {pengajuan.from || 0}-{pengajuan.to || 0} dari {pengajuan.total || 0} pengajuan
                        </span>
                        <div className="flex flex-wrap justify-end gap-2">
                            {pengajuan.links.map((link, index) => (
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

            {/* MODAL KONFIRMASI APPROVE / REJECT */}
            {selectedIzin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                {actionType === 'disetujui' ? 'Setujui Pengajuan Izin' : 'Tolak Pengajuan Izin'}
                            </h3>
                            <button onClick={() => setSelectedIzin(null)} className="text-slate-400 font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmitAction} className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                Apakah kamu yakin ingin <strong>{actionType}</strong> pengajuan izin dari <strong>{selectedIzin.pegawai?.nama}</strong> pada tanggal <strong>{selectedIzin.tanggal}</strong>?
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Catatan Admin (Opsional)</label>
                                <textarea
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                    rows="3"
                                    placeholder="Berikan alasan atau catatan tambahan..."
                                    value={data.catatan_admin}
                                    onChange={(e) => setData('catatan_admin', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setSelectedIzin(null)} className="px-5 py-2.5 text-slate-600 text-sm font-semibold">Batal</button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-5 py-2.5 text-white font-semibold rounded-xl text-sm shadow-md ${
                                        actionType === 'disetujui' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                                    }`}
                                >
                                    {processing ? 'Proses...' : 'Konfirmasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}