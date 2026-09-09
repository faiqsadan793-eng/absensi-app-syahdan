import { useEffect, useRef, useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import PegawaiLayout from '@/Layouts/PegawaiLayout';

const formatDate = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
};

export default function Presensi({
    pegawai,
    presensiHariIni,
    ringkasan = {},
    riwayatPresensi = [],
    riwayatPengajuan = [],
}) {
    const [foto, setFoto] = useState('');
    const [locationError, setLocationError] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const { errors, flash } = usePage().props;

    // Tentukan mode presensi hari ini
    const isSudahMasuk = Boolean(presensiHariIni?.jam_masuk);
    const isSudahPulang = Boolean(presensiHariIni?.jam_keluar);
    const modePresensi = !isSudahMasuk ? 'masuk' : !isSudahPulang ? 'pulang' : 'selesai';

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        setVideoReady(false);
    }, []);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // Callback ref untuk memastikan elemen <video> langsung menerima stream saat dimount
    const setVideoElement = useCallback((node) => {
        videoRef.current = node;
        if (node && streamRef.current) {
            node.srcObject = streamRef.current;
            node.play().catch((err) => {
                console.warn('Autoplay failed, user interaction required:', err);
            });
        }
    }, []);

    const openCamera = async () => {
        setCameraError('');
        setSubmitError('');
        setFoto('');

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Kamera tidak didukung pada peramban ini. Gunakan browser modern (Chrome/Edge).');
            return;
        }

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                });
            } catch (initialErr) {
                // Fallback jika constraint ideal gagal
                console.warn('Fallback standard camera constraints:', initialErr);
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: true,
                });
            }

            streamRef.current = stream;
            setCameraActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
            }
        } catch (error) {
            console.error('Camera error:', error);
            setCameraActive(false);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setCameraError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setCameraError('Perangkat kamera tidak ditemukan pada sistem ini.');
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                setCameraError('Kamera sedang digunakan oleh aplikasi lain.');
            } else {
                setCameraError('Gagal membuka kamera: ' + (error.message || 'Terjadi kesalahan'));
            }
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            setCameraError('Komponen kamera belum siap.');
            return;
        }

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (width === 0 || height === 0) {
            setCameraError('Menunggu feed kamera...');
            return;
        }

        const scale = Math.min(1, 960 / width);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);

        const ctx = canvas.getContext('2d');
        // Mirror horizontally agar sesuai tampilan preview selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        setFoto(dataUrl);
        stopCamera();
    };

    const submitAttendance = () => {
        if (!foto) {
            setCameraError('Ambil foto wajah terlebih dahulu menggunakan kamera.');
            openCamera();
            return;
        }

        setSubmitError('');
        setSubmitSuccess('');
        setLocationError('');
        setProcessing(true);

        if (!navigator.geolocation) {
            setProcessing(false);
            setLocationError('Browser tidak mendukung pendeteksian lokasi GPS.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const targetRoute = modePresensi === 'pulang'
                    ? route('pegawai.presensi.pulang')
                    : route('pegawai.presensi.masuk');

                router.post(
                    targetRoute,
                    {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        foto,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setFoto('');
                            stopCamera();
                            setSubmitSuccess(
                                modePresensi === 'pulang'
                                    ? 'Presensi pulang berhasil dicatat!'
                                    : 'Presensi masuk berhasil dicatat!'
                            );
                        },
                        onError: (requestErrors) => {
                            const firstErr = Object.values(requestErrors)[0];
                            setSubmitError(firstErr || 'Presensi gagal dikirim. Silakan periksa koneksi atau lokasi Anda.');
                        },
                        onFinish: () => {
                            setProcessing(false);
                        },
                    }
                );
            },
            (error) => {
                setProcessing(false);
                if (error.code === 1) {
                    setLocationError('Akses lokasi (GPS) ditolak. Izinkan lokasi di pengaturan browser agar dapat presensi.');
                } else if (error.code === 2) {
                    setLocationError('Posisi lokasi GPS tidak dapat ditemukan. Pastikan GPS aktif.');
                } else {
                    setLocationError('Batas waktu pengambilan lokasi GPS habis. Silakan coba kembali.');
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const alertSuccess = submitSuccess || flash?.success;
    const alertError = submitError || locationError || cameraError || errors?.latitude || errors?.foto || errors?.presensi || errors?.lokasi || flash?.error;

    return (
        <PegawaiLayout>
            <Head title="Presensi Pegawai" />

            <div className="max-w-7xl mx-auto space-y-6">
                {alertSuccess && (
                    <div role="alert" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-sm animate-fade-in">
                        <Icon name="check" className="h-5 w-5 shrink-0" />
                        <span>{alertSuccess}</span>
                    </div>
                )}

                {alertError && (
                    <div role="alert" className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm animate-fade-in">
                        <Icon name="clock" className="h-5 w-5 shrink-0" />
                        <span>{alertError}</span>
                    </div>
                )}

                {/* Banner Selamat Datang */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-7 md:p-9 text-white shadow-xl shadow-blue-500/20">
                    <div className="absolute -right-10 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                            <Icon name="smile" className="w-4 h-4" /> Selamat datang, {pegawai.nama.split(' ')[0]}!
                        </span>
                        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                            {modePresensi === 'selesai'
                                ? 'Presensi Hari Ini Selesai'
                                : modePresensi === 'pulang'
                                ? 'Waktunya Presensi Pulang'
                                : 'Siap Mencatat Kehadiran Hari Ini?'}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-blue-100">
                            {modePresensi === 'selesai'
                                ? 'Terima kasih atas kerja keras Anda hari ini. Selamat beristirahat!'
                                : modePresensi === 'pulang'
                                ? 'Anda telah melakukan presensi masuk. Ambil foto wajah dan kirim presensi pulang.'
                                : 'Pastikan berada di area radius kantor dan izinkan akses kamera & GPS browser.'}
                        </p>
                    </div>
                </section>

                {/* Stat Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hari Hadir Bulan Ini</p>
                                <p className="mt-2 text-3xl font-extrabold text-slate-900">{ringkasan.presensiBulanIni || 0}</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Icon name="calendar" className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengajuan Izin Bulan Ini</p>
                                <p className="mt-2 text-3xl font-extrabold text-slate-900">{ringkasan.pengajuanBulanIni || 0}</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <Icon name="envelope" className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hari Berjalan (Bulan Ini)</p>
                                <p className="mt-2 text-3xl font-extrabold text-slate-900">{ringkasan.hariKerjaBulanIni || 0}</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Icon name="chart" className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section Presensi & Data Pegawai */}
                <section id="presensi" className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    {/* Card Kamera / Presensi Form */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-sm">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Presensi Hari Ini</p>
                                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                                    {modePresensi === 'selesai'
                                        ? 'Presensi Hari Ini Selesai'
                                        : modePresensi === 'pulang'
                                        ? 'Sudah Presensi Masuk'
                                        : 'Belum Ada Presensi Masuk'}
                                </h2>
                            </div>
                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                                modePresensi === 'selesai'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : modePresensi === 'pulang'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-amber-50 text-amber-600'
                            }`}>
                                <Icon name={modePresensi === 'selesai' ? 'check' : 'clock'} className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Status Box Info */}
                        {isSudahMasuk && (
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200/60">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Jam Masuk</span>
                                    <p className="mt-1 text-xl font-black text-emerald-800">{presensiHariIni.jam_masuk?.slice(0, 5)} WIB</p>
                                </div>
                                <div className={`rounded-2xl p-4 border ${
                                    isSudahPulang
                                        ? 'bg-purple-50 border-purple-200/60'
                                        : 'bg-slate-50 border-slate-200/60 text-slate-400'
                                }`}>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Jam Pulang</span>
                                    <p className={`mt-1 text-xl font-black ${isSudahPulang ? 'text-purple-800' : 'text-slate-400'}`}>
                                        {isSudahPulang ? `${presensiHariIni.jam_keluar?.slice(0, 5)} WIB` : 'Belum Absen'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {modePresensi === 'selesai' ? (
                            <div className="mt-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 p-6 text-center space-y-2">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-2xl">
                                    ✓
                                </span>
                                <h3 className="text-base font-bold text-emerald-900">Seluruh Presensi Hari Ini Telah Tercatat</h3>
                                <p className="text-xs text-emerald-700">
                                    Data kehadiran Anda sudah tersimpan dengan aman di database.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {modePresensi === 'pulang'
                                        ? 'Silakan ambil foto wajah untuk melakukan presensi pulang hari ini.'
                                        : 'Wajah kamu akan terlihat langsung di kamera. Pastikan wajah berada di tengah frame sebelum mengambil foto.'}
                                </p>

                                {/* Frame Kamera / Snapshot */}
                                <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-200">
                                    {cameraActive ? (
                                        <video
                                            ref={setVideoElement}
                                            autoPlay
                                            muted
                                            playsInline
                                            onLoadedMetadata={() => setVideoReady(true)}
                                            onCanPlay={() => setVideoReady(true)}
                                            className="h-full w-full object-cover scale-x-[-1]"
                                        />
                                    ) : foto ? (
                                        <img src={foto} alt="Snapshot Wajah" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
                                            <Icon name="camera" className="h-10 w-10 text-slate-500" />
                                            <span className="text-xs font-semibold">Kamera Belum Aktif</span>
                                            <span className="text-[11px] text-slate-500">Klik tombol "Buka Kamera" di bawah untuk mengaktifkan webcam</span>
                                        </div>
                                    )}
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>

                                {/* Tombol Aksi Kamera & Kirim */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    {cameraActive ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500"
                                            >
                                                <Icon name="camera" className="h-4 w-4" />
                                                <span>Ambil Foto Wajah</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopCamera}
                                                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                                            >
                                                Tutup
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={openCamera}
                                            disabled={processing}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 disabled:opacity-60"
                                        >
                                            <Icon name="camera" className="h-4 w-4" />
                                            <span>{foto ? 'Ambil Ulang Foto' : 'Buka Kamera'}</span>
                                        </button>
                                    )}

                                    {foto && !cameraActive && (
                                        <button
                                            type="button"
                                            onClick={submitAttendance}
                                            disabled={processing}
                                            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition disabled:cursor-wait disabled:opacity-60 ${
                                                modePresensi === 'pulang'
                                                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                            }`}
                                        >
                                            <Icon name="check" className="h-4 w-4" />
                                            <span>
                                                {processing
                                                    ? 'Mencatat GPS & Foto...'
                                                    : modePresensi === 'pulang'
                                                    ? 'Kirim Presensi Pulang'
                                                    : 'Kirim Presensi Masuk'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Data Pegawai & Penempatan */}
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-900 p-6 md:p-7 text-white shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Profil Pegawai</p>
                            <h2 className="mt-1 text-2xl font-extrabold">{pegawai.nama}</h2>

                            <div className="mt-6 space-y-3.5 text-sm">
                                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400 text-xs">NRG</span>
                                    <strong className="font-mono">{pegawai.nrg}</strong>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400 text-xs">Jabatan</span>
                                    <strong>{pegawai.jabatan?.jabatan || pegawai.jabatan?.nama_jabatan || 'Pegawai'}</strong>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400 text-xs">Lokasi Kantor</span>
                                    <strong className="text-blue-300">
                                        📍 {pegawai.lokasi_presensi?.nama_lokasi || 'Kantor Pusat'}
                                    </strong>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                    <span className="text-slate-400 text-xs">Jadwal Masuk</span>
                                    <strong>{pegawai.lokasi_presensi?.jam_masuk?.slice(0, 5) || '08:00'} WIB</strong>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400 text-xs">Radius Maksimal</span>
                                    <strong className="text-emerald-400">{pegawai.lokasi_presensi?.radius || 50} Meter</strong>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Pastikan GPS perangkat Anda aktif dan Anda berada di dalam radius kantor saat mengirim presensi.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section Riwayat Terakhir */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Riwayat Presensi */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">Presensi Terbaru</h2>
                                <p className="text-xs text-slate-500">5 riwayat presensi terakhir Anda</p>
                            </div>
                            <Icon name="calendar" className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="mt-4 divide-y divide-slate-100">
                            {riwayatPresensi.length > 0 ? (
                                riwayatPresensi.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-800">{formatDate(item.tanggal_masuk)}</p>
                                            <p className="text-xs text-slate-400">
                                                Masuk: {item.jam_masuk?.slice(0, 5) || '-'} · Pulang: {item.jam_keluar?.slice(0, 5) || '-'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/50">
                                            Hadir
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="py-6 text-center text-sm text-slate-400">Belum ada catatan presensi.</p>
                            )}
                        </div>
                    </div>

                    {/* Riwayat Pengajuan */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">Pengajuan Izin Terbaru</h2>
                                <p className="text-xs text-slate-500">Status izin / sakit terkini Anda</p>
                            </div>
                            <Icon name="envelope" className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="mt-4 divide-y divide-slate-100">
                            {riwayatPengajuan.length > 0 ? (
                                riwayatPengajuan.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                                        <div>
                                            <strong className="block text-slate-800">{item.keterangan}</strong>
                                            <span className="text-xs text-slate-400">{formatDate(item.tanggal)}</span>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
                                            item.status_pengajuan === 'APPROVED'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                                : item.status_pengajuan === 'REJECTED'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                                                : 'bg-amber-50 text-amber-700 border-amber-200/60'
                                        }`}>
                                            {item.status_pengajuan === 'APPROVED' ? 'Disetujui' : item.status_pengajuan === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="py-6 text-center text-sm text-slate-400">Belum ada pengajuan izin.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </PegawaiLayout>
    );
}