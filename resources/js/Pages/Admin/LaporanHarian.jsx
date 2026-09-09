import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

export default function LaporanHarian({ laporan = {}, filters = {}, ringkasan = {} }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const [tanggal, setTanggal] = useState(filters.tanggal || todayStr);
    const [processing, setProcessing] = useState(false);

    const rows = Array.isArray(laporan) ? laporan : (laporan.data || []);

    const fetchLaporan = (selectedDate) => {
        router.get(route('admin.laporan-harian.index'), {
            tanggal: selectedDate,
        }, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const handleFilter = (e) => {
        e?.preventDefault();
        fetchLaporan(tanggal);
    };

    const handleQuickDate = (dateStr) => {
        setTanggal(dateStr);
        fetchLaporan(dateStr);
    };

    const handlePrint = () => {
        window.print();
    };

    // Format tanggal Indonesia
    const dateObj = new Date(tanggal + 'T00:00:00');
    const labelTanggalLengkap = isNaN(dateObj.getTime())
        ? tanggal
        : dateObj.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const getYesterdayStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'hadir':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Hadir Tepat</span>;
            case 'terlambat':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">Terlambat</span>;
            case 'izin':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">Izin</span>;
            case 'sakit':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">Sakit</span>;
            case 'alpa':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Alpa</span>;
            case 'libur':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">Libur</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-400">{status || '-'}</span>;
        }
    };

    return (
        <AdminLayout>
            <Head title={`Laporan Presensi Harian - ${labelTanggalLengkap}`} />

            {/* Header Halaman (Hidden saat print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Laporan Presensi Harian</h1>
                        {ringkasan.is_libur ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                🏖️ Hari Libur Akhir Pekan
                            </span>
                        ) : ringkasan.is_future ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                                ⏳ Belum Berlangsung
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                🟢 Hari Kerja Aktif
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Catatan dan status kehadiran seluruh pegawai pada <strong>{labelTanggalLengkap}</strong>.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
                >
                    <span>🖨️ Cetak / Download PDF</span>
                </button>
            </div>

            {/* Filter Tanggal Harian Tunggal (Hidden saat print) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6 print:hidden">
                <form onSubmit={handleFilter} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Pilih Tanggal Presensi
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickDate(todayStr)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                tanggal === todayStr
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            📅 Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDate(getYesterdayStr())}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                tanggal === getYesterdayStr()
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Kemarin
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>{processing ? 'Memuat...' : 'Tampilkan Laporan'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Stat Ringkasan Harian (Hidden saat print) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 print:hidden">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Tepat Waktu</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{ringkasan.total_hadir ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Terlambat</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{ringkasan.total_terlambat ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Izin / Cuti</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{ringkasan.total_izin ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Sakit</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{ringkasan.total_sakit ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Alpa</p>
                    <p className="text-2xl font-black text-slate-500 mt-1">{ringkasan.total_alpa ?? 0}</p>
                </div>
            </div>

            {/* Header Khusus Cetak Print */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-slate-800 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                    Laporan Presensi Harian Pegawai
                </h2>
                <p className="text-sm font-medium text-slate-600 mt-1">
                    Tanggal: <strong>{labelTanggalLengkap}</strong>
                </p>
            </div>

            {/* Tabel Detail Harian */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse print:text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider print:bg-slate-100">
                                <th className="py-4 px-6 print:py-2 print:px-3">No</th>
                                <th className="py-4 px-6 print:py-2 print:px-3">Pegawai</th>
                                <th className="py-4 px-6 print:py-2 print:px-3">Jabatan</th>
                                <th className="py-4 px-6 text-center print:py-2 print:px-3">Jam Masuk</th>
                                <th className="py-4 px-6 text-center print:py-2 print:px-3">Jam Pulang</th>
                                <th className="py-4 px-6 text-center print:py-2 print:px-3">Status</th>
                                <th className="py-4 px-6 print:py-2 print:px-3">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 print:divide-slate-300">
                            {rows.length > 0 ? (
                                rows.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6 text-slate-400 print:py-2 print:px-3">
                                            {(laporan.from ? laporan.from + index : index + 1)}
                                        </td>
                                        <td className="py-4 px-6 print:py-2 print:px-3">
                                            <p className="font-bold text-slate-900">{item.nama}</p>
                                            <p className="text-xs text-slate-400 font-mono">{item.nrg}</p>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 print:py-2 print:px-3">{item.jabatan}</td>
                                        <td className="py-4 px-6 text-center print:py-2 print:px-3 font-semibold text-emerald-600">
                                            {item.jam_masuk || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-center print:py-2 print:px-3 font-semibold text-rose-600">
                                            {item.jam_keluar || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-center print:py-2 print:px-3">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 text-xs print:py-2 print:px-3">
                                            {item.keterangan || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm mb-4">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-800">
                                                Belum Ada Data Pegawai
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                Belum ada data pegawai yang terdaftar pada sistem.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Print Signature Footer */}
                <div className="hidden print:grid grid-cols-2 gap-12 mt-12 pt-8 text-center text-xs">
                    <div>
                        <p className="text-slate-500">Mengetahui,</p>
                        <p className="font-bold text-slate-900 mt-1">Kepala Bagian SDM / HRD</p>
                        <div className="h-20" />
                        <p className="font-bold underline text-slate-900">( ............................................ )</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                        <p className="font-bold text-slate-900 mt-1">Administrator Presensi</p>
                        <div className="h-20" />
                        <p className="font-bold underline text-slate-900">( ............................................ )</p>
                    </div>
                </div>

                {laporan.links && laporan.links.length > 3 && (
                    <nav className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 print:hidden" aria-label="Pagination laporan harian">
                        <span className="text-xs text-slate-500">Menampilkan {laporan.from || 0}-{laporan.to || 0} dari {laporan.total || 0} pegawai</span>
                        <div className="flex flex-wrap justify-end gap-2">
                            {laporan.links.map((link, index) => (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    disabled={!link.url || link.active || processing}
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
        </AdminLayout>
    );
}
