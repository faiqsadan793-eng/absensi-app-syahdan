import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function LokasiIndex({ lokasi = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_lokasi: '',
        latitude: '',
        longitude: '',
        radius: 50,
        alamat_lokasi: '',
        tipe_lokasi: 'Pusat',
        zona_waktu: 'WIB',
        jam_masuk: '08:00',
        jam_pulang: '17:00',
    });

    const openModalCreate = () => {
        setEditItem(null);
        clearErrors();
        reset();
        setData({
            nama_lokasi: '',
            latitude: '',
            longitude: '',
            radius: 50,
            alamat_lokasi: '',
            tipe_lokasi: 'Pusat',
            zona_waktu: 'WIB',
            jam_masuk: '08:00',
            jam_pulang: '17:00',
        });
        setIsModalOpen(true);
    };

    const openModalEdit = (item) => {
        setEditItem(item);
        clearErrors();
        setData({
            nama_lokasi: item.nama_lokasi,
            latitude: item.latitude,
            longitude: item.longitude,
            radius: item.radius,
            alamat_lokasi: item.alamat_lokasi || '',
            tipe_lokasi: item.tipe_lokasi || 'Pusat',
            zona_waktu: item.zona_waktu || 'WIB',
            jam_masuk: item.jam_masuk ? item.jam_masuk.slice(0, 5) : '08:00',
            jam_pulang: item.jam_pulang ? item.jam_pulang.slice(0, 5) : '17:00',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editItem) {
            put(route('admin.lokasi.update', editItem.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.lokasi.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id, nama) => {
        if (confirm(`Apakah yakin ingin menghapus lokasi "${nama}"?`)) {
            router.delete(route('admin.lokasi.destroy', id));
        }
    };

    // Mengambil Koordinat Otomatis saat ini via browser Admin
    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setData((prevData) => ({
                        ...prevData,
                        latitude: position.coords.latitude.toFixed(7),
                        longitude: position.coords.longitude.toFixed(7),
                    }));
                },
                (error) => alert('Gagal mengambil lokasi GPS. Pastikan izin lokasi diaktifkan!'),
                { enableHighAccuracy: true }
            );
        }
    };

    const items = Array.isArray(lokasi) ? lokasi : (lokasi.data || []);

    return (
        <AdminLayout>
            <Head title="Kelola Lokasi Presensi" />

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
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lokasi & Jadwal Presensi</h1>
                    <p className="text-sm text-slate-500 mt-1">Atur titik koordinat kantor, batasan radius geofence, dan jam kerja masuk/pulang.</p>
                </div>
                <button
                    onClick={openModalCreate}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
                >
                    <span>+ Tambah Lokasi</span>
                </button>
            </div>

            {/* List Cards Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{item.nama_lokasi}</h3>
                                        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                                            {item.tipe_lokasi || 'Pusat'} · {item.zona_waktu || 'WIB'}
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                        Radius: {item.radius} Meter
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">{item.alamat_lokasi || 'Tidak ada alamat lengkap'}</p>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-blue-50/60 rounded-2xl p-3 border border-blue-100">
                                        <p className="text-[10px] font-bold uppercase text-blue-700">Jam Masuk</p>
                                        <p className="text-sm font-extrabold text-blue-900">{item.jam_masuk?.slice(0, 5) || '08:00'} {item.zona_waktu || 'WIB'}</p>
                                    </div>
                                    <div className="bg-purple-50/60 rounded-2xl p-3 border border-purple-100">
                                        <p className="text-[10px] font-bold uppercase text-purple-700">Jam Pulang</p>
                                        <p className="text-sm font-extrabold text-purple-900">{item.jam_pulang?.slice(0, 5) || '17:00'} {item.zona_waktu || 'WIB'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1 font-mono text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Latitude:</span>
                                        <span className="font-semibold text-slate-700">{item.latitude}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Longitude:</span>
                                        <span className="font-semibold text-slate-700">{item.longitude}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                                        <span className="text-slate-400">Pegawai Terdaftar:</span>
                                        <span className="font-bold text-blue-600">{item.pegawai_count || 0} Orang</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openModalEdit(item)}
                                    className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.nama_lokasi)}
                                    className="px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-400 text-sm">
                        Belum ada lokasi kantor yang terdaftar.
                    </div>
                )}
            </div>

            {/* MODAL FORM (TAMBAH / EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editItem ? 'Edit Lokasi Presensi' : 'Tambah Lokasi Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Lokasi / Kantor</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                    placeholder="Contoh: Kantor Pusat, Cabang Jakarta"
                                    value={data.nama_lokasi}
                                    onChange={(e) => setData('nama_lokasi', e.target.value)}
                                    required
                                />
                                {errors.nama_lokasi && <span className="text-xs text-rose-500 mt-1">{errors.nama_lokasi}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Zona Waktu</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                        value={data.zona_waktu}
                                        onChange={(e) => setData('zona_waktu', e.target.value)}
                                    >
                                        <option value="WIB">WIB (UTC+7)</option>
                                        <option value="WITA">WITA (UTC+8)</option>
                                        <option value="WIT">WIT (UTC+9)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Radius (Meter)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                        placeholder="50"
                                        value={data.radius}
                                        onChange={(e) => setData('radius', e.target.value)}
                                        required
                                    />
                                    {errors.radius && <span className="text-xs text-rose-500 mt-1">{errors.radius}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jadwal Jam Masuk</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                                        value={data.jam_masuk}
                                        onChange={(e) => setData('jam_masuk', e.target.value)}
                                        required
                                    />
                                    {errors.jam_masuk && <span className="text-xs text-rose-500 mt-1">{errors.jam_masuk}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jadwal Jam Pulang</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                                        value={data.jam_pulang}
                                        onChange={(e) => setData('jam_pulang', e.target.value)}
                                        required
                                    />
                                    {errors.jam_pulang && <span className="text-xs text-rose-500 mt-1">{errors.jam_pulang}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                                        placeholder="-6.2000000"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        required
                                    />
                                    {errors.latitude && <span className="text-xs text-rose-500 mt-1">{errors.latitude}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                                        placeholder="106.8166660"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        required
                                    />
                                    {errors.longitude && <span className="text-xs text-rose-500 mt-1">{errors.longitude}</span>}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                            >
                                🎯 Dapatkan Titik GPS Perangkat Saat Ini
                            </button>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Alamat Lengkap Kantor</label>
                                <textarea
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                    rows="2"
                                    placeholder="Jalan, nomor, kelurahan, kota..."
                                    value={data.alamat_lokasi}
                                    onChange={(e) => setData('alamat_lokasi', e.target.value)}
                                ></textarea>
                                {errors.alamat_lokasi && <span className="text-xs text-rose-500 mt-1">{errors.alamat_lokasi}</span>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 text-sm font-semibold">Batal</button>
                                <button type="submit" disabled={processing} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md">
                                    {processing ? 'Menyimpan...' : editItem ? 'Perbarui Lokasi' : 'Simpan Lokasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}