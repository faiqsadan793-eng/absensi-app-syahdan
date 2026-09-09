import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import PegawaiLayout from '@/Layouts/PegawaiLayout';

const formatDate = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
};

export default function KetidakhadiranIndex({ ketidakhadiran = { data: [] } }) {
    const { flash } = usePage().props;
    const [selectedDelete, setSelectedDelete] = useState(null);

    const handleDelete = (id) => {
        router.delete(route('pegawai.ketidakhadiran.destroy', id), {
            onSuccess: () => setSelectedDelete(null),
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Disetujui</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">Ditolak</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">Menunggu</span>;
        }
    };

    const getKategoriBadge = (keterangan) => {
        const ket = keterangan?.toLowerCase();
        if (ket === 'sakit') {
            return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200/50">Sakit</span>;
        }
        if (ket === 'cuti') {
            return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-purple-50 text-purple-600 border border-purple-200/50">Cuti</span>;
        }
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200/50">Izin</span>;
    };

    const items = ketidakhadiran.data || [];

    return (
        <PegawaiLayout>
            <Head title="Pengajuan Ketidakhadiran" />

            <div className="max-w-7xl mx-auto space-y-6">
                {flash?.success && (
                    <div role="alert" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                        <Icon name="check" className="h-5 w-5 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div role="alert" className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                        <Icon name="clock" className="h-5 w-5 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pengajuan Izin & Sakit</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola dan pantau status permohonan izin, sakit, atau cuti kerja kamu.</p>
                    </div>
                    <Link
                        href={route('pegawai.ketidakhadiran.create')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
                    >
                        <span className="text-lg leading-none">+</span>
                        <span>Buat Pengajuan</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                    <th className="py-4 px-6">Kategori</th>
                                    <th className="py-4 px-6">Tanggal</th>
                                    <th className="py-4 px-6">Keterangan / Alasan</th>
                                    <th className="py-4 px-6">Bukti Lampiran</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-4 px-6">
                                                {getKategoriBadge(item.keterangan)}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-slate-800">
                                                {formatDate(item.tanggal)}
                                            </td>
                                            <td className="py-4 px-6 max-w-xs">
                                                <p className="text-slate-800 text-xs font-semibold truncate">{item.deskripsi}</p>
                                                {item.catatan_admin && (
                                                    <p className="text-[11px] text-slate-400 mt-0.5">Catatan Admin: {item.catatan_admin}</p>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {item.file ? (
                                                    <a
                                                        href={route('pegawai.ketidakhadiran.file', item.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                                    >
                                                        📄 Lihat Bukti
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(item.status_pengajuan)}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('pegawai.ketidakhadiran.show', item.id)}
                                                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                                    >
                                                        Detail
                                                    </Link>
                                                    {item.status_pengajuan === 'PENDING' && (
                                                        <>
                                                            <Link
                                                                href={route('pegawai.ketidakhadiran.edit', item.id)}
                                                                className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedDelete(item)}
                                                                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                            >
                                                                Batal
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                                            Belum ada riwayat pengajuan ketidakhadiran. Klik <strong>+ Buat Pengajuan</strong> untuk memulai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {ketidakhadiran.links && ketidakhadiran.links.length > 3 && (
                        <nav className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4" aria-label="Pagination">
                            <span className="text-xs text-slate-500">
                                Menampilkan {ketidakhadiran.from || 0}-{ketidakhadiran.to || 0} dari {ketidakhadiran.total || 0} pengajuan
                            </span>
                            <div className="flex flex-wrap justify-end gap-2">
                                {ketidakhadiran.links.map((link, index) => (
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

                {selectedDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                    <Icon name="clock" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Batalkan Pengajuan?</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Pengajuan {selectedDelete.keterangan} pada tanggal {formatDate(selectedDelete.tanggal)} akan dihapus.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDelete(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(selectedDelete.id)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-500/20"
                                >
                                    Ya, Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PegawaiLayout>
    );
}
