import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';

export default function PegawaiLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const { url, props } = usePage();
    const user = props.auth?.user;
    const pegawai = props.pegawai;
    const displayName = pegawai?.nama || user?.name || user?.username || 'Pegawai';
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
            <Head title="Dashboard Pegawai" />
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transform transition-transform duration-300 shadow-xl md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div>
                    <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">P</div>
                        <div><h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">Presensi.<span className="text-blue-600">App</span></h1><span className="text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200/50">Employee Space</span></div>
                    </div>
                    <nav className="p-4 space-y-1.5" aria-label="Menu utama">
                        <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workspace</div>
                        <Link href={route('pegawai.dashboard')} className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${url === '/pegawai/dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}><Icon name="chart" className="w-4 h-4" /><span>Dashboard</span></Link>
                        <Link href={route('pegawai.ketidakhadiran.index')} className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${url.startsWith('/pegawai/ketidakhadiran') ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}><Icon name="envelope" className="w-4 h-4" /><span>Pengajuan Izin</span></Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-100"><button type="button" onClick={() => setLogoutOpen(true)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-md shadow-rose-500/20 transition-colors"><Icon name="logout" className="w-4 h-4" /><span>Logout</span></button></div>
            </aside>
            {logoutOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setLogoutOpen(false)}><div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 shadow-2xl p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><Icon name="logout" className="w-5 h-5" /></div><div><h2 className="text-lg font-extrabold text-slate-900">Keluar dari akun?</h2><p className="mt-1 text-sm text-slate-500">Sesi kamu akan diakhiri dan perlu login kembali.</p></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setLogoutOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button><Link href={route('logout')} method="post" as="button" className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl">Logout</Link></div></div></div>}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30"><div className="flex items-center gap-4"><button type="button" aria-label="Buka menu" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 md:hidden"><Icon name="menu" className="w-4 h-4" /></button><h2 className="text-xl font-bold text-slate-900 tracking-tight">Portal Pegawai</h2></div><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200">{initials}</div><div className="hidden sm:block max-w-40"><p className="text-xs font-bold text-slate-900 truncate">{displayName}</p><p className="text-[11px] text-slate-500 truncate">{pegawai?.jabatan?.jabatan || pegawai?.jabatan?.nama_jabatan || 'Pegawai'}</p></div><span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Aktif</span></div></header>
                <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}