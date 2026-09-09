import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import PegawaiLayout from '@/Layouts/PegawaiLayout';

const formatDate = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
};

export default function KetidakhadiranShow({ ketidakhadiran }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Disetujui</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">Ditolak</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">Menunggu Konfirmasi</span>;
        }
    };

    return (
        <PegawaiLayout>
            <Head title={`Detail Pengajuan - ${ketidakhadiran.keterangan}`} />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('pegawai.ketidakhadiran.index')}
                            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            ← Kembali
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Detail Pengajuan</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Rincian status pengajuan ketidakhadiran kamu.</p>
                        </div>
                    </div>
                    {getStatusBadge(ketidakhadiran.status_pengajuan)}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Kategori</p>
                            <p className="text-lg font-extrabold text-slate-900 mt-1">{ketidakhadiran.keterangan}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Tanggal</p>
                            <p className="text-lg font-extrabold text-slate-900 mt-1">{formatDate(ketidakhadiran.tanggal)}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Alasan / Deskripsi</p>
                        <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {ketidakhadiran.deskripsi || '-'}
                        </p>
                    </div>

                    {ketidakhadiran.catatan_admin && (
                        <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4">
                            <p className="text-xs font-bold text-amber-800 uppercase">Catatan Dari Admin / Atasan</p>
                            <p className="text-sm text-amber-900 mt-1">{ketidakhadiran.catatan_admin}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Dokumen / Bukti Pendukung</p>
                        {ketidakhadiran.file ? (
                            <a
                                href={route('pegawai.ketidakhadiran.file', ketidakhadiran.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                <span>📄 Buka Bukti Lampiran</span>
                            </a>
                        ) : (
                            <p className="text-xs text-slate-400">Tidak ada lampiran dokumen.</p>
                        )}
                    </div>

                    {ketidakhadiran.status_pengajuan === 'PENDING' && (
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <Link
                                href={route('pegawai.ketidakhadiran.edit', ketidakhadiran.id)}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
                            >
                                Edit Pengajuan
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </PegawaiLayout>
    );
}
