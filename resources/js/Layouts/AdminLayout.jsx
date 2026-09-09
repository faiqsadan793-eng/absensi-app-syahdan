import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';

export default function AdminLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { url, props } = usePage();
    const currentUser = props.auth?.user ?? user;
    const pendingIzinCount = Number(props.pendingIzinCount || 0);
    const displayName = currentUser?.name || currentUser?.username || 'Administrator';
    const displayEmail = currentUser?.email || `@${currentUser?.username || 'administrator'}`;
    const initials = displayName.slice(0, 2).toUpperCase();
    const menuItems = [
        { name: 'Dashboard', href: route('admin.dashboard'), icon: 'chart', active: url.startsWith('/admin/dashboard') },
        { name: 'Data Pegawai', href: route('admin.pegawai.index'), icon: 'people', active: url.startsWith('/admin/pegawai') },
        { name: 'Data Jabatan', href: route('admin.jabatan.index'), icon: 'briefcase', active: url.startsWith('/admin/jabatan') },
        { name: 'Lokasi & Radius', href: route('admin.lokasi.index'), icon: 'location', active: url.startsWith('/admin/lokasi') },
        { name: 'Riwayat Presensi', href: route('admin.riwayat.index'), icon: 'calendar', active: url.startsWith('/admin/riwayat-presensi') },
        { name: 'Persetujuan Izin', href: route('admin.izin.index'), icon: 'envelope', active: url.startsWith('/admin/izin'), badge: pendingIzinCount },
        { name: 'Laporan Harian', href: route('admin.laporan-harian.index'), icon: 'clock', active: url.startsWith('/admin/laporan-harian') },
        { name: 'Rekap Bulanan', href: route('admin.laporan-bulanan.index'), icon: 'printer', active: url.startsWith('/admin/laporan-bulanan') || url === '/admin/laporan' || url.startsWith('/admin/laporan?') || url.startsWith('/admin/laporan/') },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
            {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-slate-100 gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 text-xl">P</div>
                        <div><h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">Presensi.<span className="text-blue-600">App</span></h1><span className="text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200/50">Admin Space</span></div>
                    </div>
                    <nav className="p-4 space-y-1.5" aria-label="Menu utama">
                        <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</div>
                        {menuItems.map((item) => <Link key={item.name} href={item.href} className={`group relative flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${item.active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold' : 'text-slate-600 hover:bg-slate-100/80 hover:text-blue-600'}`}><span className="flex items-center gap-3"><Icon name={item.icon} label={item.name} className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.active ? '' : 'opacity-80'}`} /><span>{item.name}</span></span>{item.badge > 0 && <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.active ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'}`}>{item.badge}</span>}</Link>)}
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-100"><button type="button" onClick={() => setIsLogoutModalOpen(true)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-md shadow-rose-500/20 transition-colors" title="Logout"><Icon name="logout" className="w-4 h-4" /><span>Logout</span></button></div>
            </aside>
            {isLogoutModalOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)}><div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 shadow-2xl p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><Icon name="logout" className="w-5 h-5" /></div><div><h2 id="logout-title" className="text-lg font-extrabold text-slate-900">Keluar dari akun?</h2><p className="mt-1 text-sm text-slate-500">Sesi admin akan diakhiri dan kamu perlu login kembali.</p></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsLogoutModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button><Link href={route('logout')} method="post" as="button" className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-500/20 transition-colors">Logout</Link></div></div></div>}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30"><div className="flex items-center gap-4"><button type="button" aria-label="Buka menu" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 md:hidden hover:bg-slate-200 transition-colors"><Icon name="menu" className="w-4 h-4" /></button><h2 className="text-xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h2></div><div className="flex items-center gap-3"><div className="hidden sm:flex items-center gap-3"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200">{initials}</div><div className="max-w-36 overflow-hidden"><p className="text-xs font-bold text-slate-900 truncate">{displayName}</p><p className="text-[11px] text-slate-500 truncate">{displayEmail}</p></div></div></div><span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Active</span></div></header>
                <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
