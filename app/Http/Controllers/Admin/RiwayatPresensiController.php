<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\Presensi;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RiwayatPresensiController extends Controller
{
    public function index(Request $request)
    {
        $query = Presensi::with(['pegawai.jabatan', 'pegawai.lokasiPresensi'])->latest('tanggal_masuk')->latest('jam_masuk');

        $query->when($request->filled('tanggal_mulai'), fn ($query) => $query->whereDate('tanggal_masuk', '>=', $request->tanggal_mulai));
        $query->when($request->filled('tanggal_selesai'), fn ($query) => $query->whereDate('tanggal_masuk', '<=', $request->tanggal_selesai));
        $query->when($request->filled('pegawai_id'), fn ($query) => $query->where('id_pegawai', $request->integer('pegawai_id')));
        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search')->toString();

            $query->whereHas('pegawai', fn ($pegawaiQuery) => $pegawaiQuery
                ->where('nama', 'like', "%{$search}%")
                ->orWhere('nrg', 'like', "%{$search}%"));
        });

        $riwayat = $query->paginate(15)->withQueryString();
        $riwayat->through(function (Presensi $presensi) {
            $jamMasukKantor = $presensi->pegawai?->lokasiPresensi?->jam_masuk
                ? substr($presensi->pegawai->lokasiPresensi->jam_masuk, 0, 8)
                : '08:00:00';

            return [
                'id' => $presensi->id,
                'pegawai' => $presensi->pegawai,
                'tanggal' => $presensi->tanggal_masuk?->format('Y-m-d') ?? $presensi->tanggal_masuk,
                'jam_masuk' => $presensi->jam_masuk,
                'jam_pulang' => $presensi->jam_keluar,
                'foto_masuk' => $presensi->foto_masuk ? route('admin.riwayat.foto', [$presensi, 'masuk']) : null,
                'foto_pulang' => $presensi->foto_keluar ? route('admin.riwayat.foto', [$presensi, 'pulang']) : null,
                'status' => $presensi->jam_masuk > $jamMasukKantor ? 'Terlambat' : 'Hadir',
                'lokasi_masuk' => $presensi->latitude_masuk !== null && $presensi->longitude_masuk !== null
                    ? [(float) $presensi->latitude_masuk, (float) $presensi->longitude_masuk]
                    : null,
                'jarak_meter' => $presensi->jarak_masuk_meter !== null ? (float) $presensi->jarak_masuk_meter : null,
            ];
        });

        return Inertia::render('Admin/RiwayatPresensi', [
            'riwayat' => $riwayat,
            'pegawai' => Pegawai::orderBy('nama')->get(['id', 'nama', 'nrg']),
            'filters' => $request->only(['tanggal_mulai', 'tanggal_selesai', 'pegawai_id', 'status', 'search']),
        ]);
    }

    public function foto(Presensi $presensi, string $jenis)
    {
        abort_unless(in_array($jenis, ['masuk', 'pulang'], true), 404);

        $path = $jenis === 'masuk' ? $presensi->foto_masuk : $presensi->foto_keluar;

        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk('local');

        abort_if($path === null || ! $storage->exists($path), 404);

        return $storage->response($path);
    }
}
