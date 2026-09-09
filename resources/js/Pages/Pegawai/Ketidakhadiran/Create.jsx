import { Head, Link, useForm } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import PegawaiLayout from '@/Layouts/PegawaiLayout';

export default function KetidakhadiranCreate() {
    const { data, setData, post, processing, errors } = useForm({
        keterangan: 'Izin',
        tanggal: new Date().toISOString().slice(0, 10),
        deskripsi: '',
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('pegawai.ketidakhadiran.store'));
    };

    return (
        <PegawaiLayout>
            <Head title="Form Pengajuan Ketidakhadiran" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('pegawai.ketidakhadiran.index')}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        ← Kembali
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Form Pengajuan Izin</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Ajukan permohonan izin, sakit, atau cuti kerja ke admin.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Kategori Pengajuan</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Izin', 'Sakit', 'Cuti'].map((kategori) => (
                                    <button
                                        key={kategori}
                                        type="button"
                                        onClick={() => setData('keterangan', kategori)}
                                        className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
                                            data.keterangan === kategori
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {kategori}
                                    </button>
                                ))}
                            </div>
                            {errors.keterangan && <p className="text-xs text-rose-500 mt-1.5">{errors.keterangan}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tanggal Tidak Masuk</label>
                            <input
                                type="date"
                                value={data.tanggal}
                                onChange={(e) => setData('tanggal', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                required
                            />
                            {errors.tanggal && <p className="text-xs text-rose-500 mt-1.5">{errors.tanggal}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Keterangan / Alasan Lengkap</label>
                            <textarea
                                rows="3"
                                placeholder="Jelaskan alasan pengajuan Anda secara rinci..."
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                required
                            ></textarea>
                            {errors.deskripsi && <p className="text-xs text-rose-500 mt-1.5">{errors.deskripsi}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Bukti Surat / Dokumen Pendukung (Opsional)
                            </label>
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setData('file', e.target.files[0])}
                                    className="hidden"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer inline-flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                                        📄
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 hover:underline">
                                        {data.file ? data.file.name : 'Pilih file surat dokter / bukti pendukung'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 mt-1">Format: PDF, JPG, PNG (Maks 5MB)</span>
                                </label>
                            </div>
                            {errors.file && <p className="text-xs text-rose-500 mt-1.5">{errors.file}</p>}
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <Link
                                href={route('pegawai.ketidakhadiran.index')}
                                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PegawaiLayout>
    );
}
