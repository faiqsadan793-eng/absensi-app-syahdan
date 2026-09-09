import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

export default function LaporanBulanan({ rekap = {}, filters = {}, ringkasan = {} }) {
    const [bulan, setBulan] = useState(filters.bulan || String(new Date().getMonth() + 1).padStart(2, '0'));
    const [tahun, setTahun] = useState(filters.tahun || String(new Date().getFullYear()));
    const [processing, setProcessing] = useState(false);

    const rows = Array.isArray(rekap) ? rekap : (rekap.data || []);

    const fetchLaporan = (selectedBulan, selectedTahun) => {
        router.get(route('admin.laporan-bulanan.index'), {
            bulan: selectedBulan,
            tahun: selectedTahun,
        }, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const handleFilter = (e) => {
        e?.preventDefault();
        fetchLaporan(bulan, tahun);
    };

    const handlePrint = () => {
        window.print();
    };

    const daftarBulan = [
        { id: '01', nama: 'Januari' },
        { id: '02', nama: 'Februari' },
        { id: '03', nama: 'Maret' },
        { id: '04', nama: 'April' },
        { id: '05', nama: 'Mei' },
        { id: '06', nama: 'Juni' },
        { id: '07', nama: 'Juli' },
        { id: '08', nama: 'Agustus' },
        { id: '09', nama: 'September' },
        { id: '10', nama: 'Oktober' },
        { id: '11', nama: 'November' },
        { id: '12', nama: 'Desember' },
    ];

    const namaBulanTerpilih = daftarBulan.find((b) => b.id === String(bulan).padStart(2, '0'))?.nama || 'Bulan';
    const labelPeriode = `${namaBulanTerpilih} ${tahun}`;

    // Summary counters (from ringkasan or calculated)
    const totalHadirSemua = ringkasan.total_hadir ?? rows.reduce((acc, curr) => acc + (curr.total_hadir || 0), 0);
    const totalTerlambatSemua = ringkasan.total_terlambat ?? rows.reduce((acc, curr) => acc + (curr.total_terlambat || 0), 0);
    const totalIzinSemua = ringkasan.total_izin ?? rows.reduce((acc, curr) => acc + (curr.total_izin || 0), 0);
    const totalSakitSemua = ringkasan.total_sakit ?? rows.reduce((acc, curr) => acc + (curr.total_sakit || 0), 0);
    const totalAlpaSemua = ringkasan.total_alpa ?? rows.reduce((acc, curr) => acc + (curr.total_alpa || 0), 0);

    return (
        <AdminLayout>
            <Head title={`Rekap Laporan Presensi Bulanan - ${labelPeriode}`} />

            {/* Header Halaman (Hidden saat print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rekap Laporan Presensi Bulanan</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Akumulasi total kehadiran, keterlambatan, izin, sakit, dan alpa pegawai periode <strong>{labelPeriode}</strong>.
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

            {/* Filter Periode Bulanan (Hidden saat print) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6 print:hidden">
                <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                    <div className="w-56">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Bulan
                        </label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                            value={bulan}
                            onChange={(e) => setBulan(e.target.value)}
                        >
                            {daftarBulan.map((b) => (
                                <option key={b.id} value={b.id}>{b.nama}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-40">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Tahun
                        </label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{processing ? 'Memuat...' : 'Tampilkan Rekap'}</span>
                    </button>
                </form>
            </div>

            {/* Stat Ringkasan Bulanan (Hidden saat print) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 print:hidden">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Tepat Waktu</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{totalHadirSemua}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Terlambat</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{totalTerlambatSemua}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Izin / Cuti</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{totalIzinSemua}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Sakit</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{totalSakitSemua}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Alpa</p>
                    <p className="text-2xl font-black text-slate-500 mt-1">{totalAlpaSemua}</p>
                </div>
            </div>

            {/* Header Khusus Cetak Print */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-slate-800 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                    Laporan Rekapitulasi Presensi Pegawai
                </h2>
                <p className="text-sm font-medium text-slate-600 mt-1">
                    Periode: <strong>{labelPeriode}</strong>
                </p>
            </div>

            {/* Tabel Rekapitulasi Bulanan */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse print:text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider print:bg-slate-100">
                                <th className="py-4 px-6 print:py-2 print:px-3">No</th>
                                <th className="py-4 px-6 print:py-2 print:px-3">Pegawai</th>
                                <th className="py-4 px-6 print:py-2 print:px-3">Jabatan</th>
                                <th className="py-4 px-6 text-center text-emerald-700 print:py-2 print:px-3 font-bold">Hadir Tepat</th>
                                <th className="py-4 px-6 text-center text-amber-700 print:py-2 print:px-3 font-bold">Terlambat</th>
                                <th className="py-4 px-6 text-center text-blue-700 print:py-2 print:px-3 font-bold">Izin</th>
                                <th className="py-4 px-6 text-center text-rose-700 print:py-2 print:px-3 font-bold">Sakit</th>
                                <th className="py-4 px-6 text-center text-slate-600 print:py-2 print:px-3 font-bold">Alpa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 print:divide-slate-300">
                            {rows.length > 0 ? (
                                rows.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6 text-slate-400 print:py-2 print:px-3">
                                            {(rekap.from ? rekap.from + index : index + 1)}
                                        </td>
                                        <td className="py-4 px-6 print:py-2 print:px-3">
                                            <p className="font-bold text-slate-900">{item.nama}</p>
                                            <p className="text-xs text-slate-400 font-mono">{item.nrg}</p>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 print:py-2 print:px-3">{item.jabatan}</td>
                                        <td className="py-4 px-6 text-center font-bold text-emerald-600 print:py-2 print:px-3">{item.total_hadir}</td>
                                        <td className="py-4 px-6 text-center font-bold text-amber-600 print:py-2 print:px-3">{item.total_terlambat}</td>
                                        <td className="py-4 px-6 text-center font-bold text-blue-600 print:py-2 print:px-3">{item.total_izin}</td>
                                        <td className="py-4 px-6 text-center font-bold text-rose-600 print:py-2 print:px-3">{item.total_sakit}</td>
                                        <td className="py-4 px-6 text-center font-bold text-slate-400 print:py-2 print:px-3">{item.total_alpa}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm mb-4">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-800">
                                                Data Rekap Presensi Kosong
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                Belum ada data presensi yang tercatat pada periode {labelPeriode}.
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

                {rekap.links && rekap.links.length > 3 && (
                    <nav className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 print:hidden" aria-label="Pagination laporan bulanan">
                        <span className="text-xs text-slate-500">Menampilkan {rekap.from || 0}-{rekap.to || 0} dari {rekap.total || 0} pegawai</span>
                        <div className="flex flex-wrap justify-end gap-2">
                            {rekap.links.map((link, index) => (
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
