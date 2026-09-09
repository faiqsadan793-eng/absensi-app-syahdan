import AdminLayout from '@/Layouts/AdminLayout';
import Icon from '@/Components/Icon';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ totalPegawai, hadirHariIni, izinPending, aktivitasTerbaru = [] }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            {/* Banner Welcome */}
            <div className="relative mb-8 p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/20 overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-white/20 rounded-full backdrop-blur-md">
                        <span>Halo Admin, Selamat Datang!</span>
                        <Icon name="smile" label="Selamat datang" className="w-4 h-4" />
                    </span>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Pantau Kehadiran Tim Kamu Secara Real-time.</h1>
                    <p className="mt-2 text-blue-100 text-sm">Semua data presensi, titik GPS lokasi, dan pengajuan izin pegawai hari ini tersusun dengan rapi.</p>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pegawai</span>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="people" label="Total Pegawai" className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-extrabold text-slate-900">{totalPegawai}</h3>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Aktif Kerja</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hadir Hari Ini</span>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="check" label="Hadir Hari Ini" className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-extrabold text-slate-900">{hadirHariIni}</h3>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Hari ini</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengajuan Pending</span>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="clock" label="Pengajuan Pending" className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-extrabold text-slate-900">{izinPending}</h3>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Butuh Verifikasi</span>
                    </div>
                </div>
            </div>

            {/* Activity Table Preview */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Aktivitas Absen Terakhir</h3>
                        <p className="text-xs text-slate-500">Daftar presensi terbaru pegawai yang masuk hari ini</p>
                    </div>
                    <Link href={route('admin.riwayat.index')} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                        Lihat Semua →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="pb-3 px-4">Pegawai</th>
                                <th className="pb-3 px-4">Jam Masuk</th>
                                <th className="pb-3 px-4">Status Lokasi</th>
                                <th className="pb-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {aktivitasTerbaru.length > 0 ? aktivitasTerbaru.map((aktivitas) => (
                                <tr key={aktivitas.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-900">{aktivitas.nama}</td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-900">{aktivitas.jam_masuk}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                            Tercatat
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-xs font-bold text-slate-400">Tersimpan</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="py-8 text-center text-sm text-slate-400">Belum ada presensi hari ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}