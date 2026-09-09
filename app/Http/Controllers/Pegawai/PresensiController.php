<?php

namespace App\Http\Controllers\Pegawai;

use App\Helpers\GeoHelper;
use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PresensiController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $pegawai = $user->pegawai;
        $today = now()->format('Y-m-d');
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        $presensiHariIni = Presensi::where('id_pegawai', $pegawai->id)
            ->whereDate('tanggal_masuk', $today)
            ->first();

        $presensiBulanIni = Presensi::where('id_pegawai', $pegawai->id)
            ->whereBetween('tanggal_masuk', [$monthStart, $monthEnd])
            ->count();

        $pengajuanBulanIni = $pegawai->ketidakhadiran()
            ->whereBetween('tanggal', [$monthStart, $monthEnd])
            ->count();

        $riwayatPresensi = Presensi::where('id_pegawai', $pegawai->id)
            ->latest('tanggal_masuk')
            ->latest('jam_masuk')
            ->limit(5)
            ->get(['id', 'tanggal_masuk', 'jam_masuk', 'tanggal_keluar', 'jam_keluar']);

        $riwayatPengajuan = $pegawai->ketidakhadiran()
            ->latest('tanggal')
            ->limit(3)
            ->get(['id', 'keterangan', 'tanggal', 'status_pengajuan', 'catatan_admin']);

        return Inertia::render('Pegawai/Presensi', [
            'presensiHariIni' => $presensiHariIni,
            'pegawai' => $pegawai->load(['jabatan', 'lokasiPresensi']),
            'ringkasan' => [
                'presensiBulanIni' => $presensiBulanIni,
                'pengajuanBulanIni' => $pengajuanBulanIni,
                'hariKerjaBulanIni' => now()->day,
            ],
            'riwayatPresensi' => $riwayatPresensi,
            'riwayatPengajuan' => $riwayatPengajuan,
        ]);
    }

    public function storeMasuk(Request $request): RedirectResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'foto' => ['required', 'string', 'max:6990507', 'regex:/^data:image\/png;base64,[A-Za-z0-9+\/=\r\n]+$/'],
        ]);

        $pegawai = $request->user()->pegawai;

        if ($pegawai === null) {
            abort(403, 'Akun belum terhubung ke data pegawai.');
        }

        $lokasi = $pegawai->lokasiPresensi;

        if ($lokasi === null) {
            throw ValidationException::withMessages([
                'lokasi' => 'Lokasi presensi pegawai belum dikonfigurasi.',
            ]);
        }

        $jarakMeter = GeoHelper::calculateDistance(
            $request->float('latitude'),
            $request->float('longitude'),
            $lokasi->latitude,
            $lokasi->longitude,
        );

        if ($jarakMeter > $lokasi->radius) {
            throw ValidationException::withMessages([
                'latitude' => "Anda berada di luar radius lokasi presensi (Jarak: {$jarakMeter}m, Maksimal: {$lokasi->radius}m).",
            ]);
        }

        $tanggalMasuk = now()->toDateString();

        // Cek apakah ada izin/sakit yang sudah disetujui pada tanggal ini
        if ($pegawai->ketidakhadiran()
            ->whereDate('tanggal', $tanggalMasuk)
            ->where('status_pengajuan', 'APPROVED')
            ->exists()) {
            throw ValidationException::withMessages([
                'presensi' => 'Anda memiliki pengajuan izin/sakit yang telah disetujui untuk hari ini.',
            ]);
        }

        if (Presensi::where('id_pegawai', $pegawai->id)
            ->whereDate('tanggal_masuk', $tanggalMasuk)
            ->exists()) {
            throw ValidationException::withMessages([
                'presensi' => 'Presensi masuk untuk hari ini sudah tercatat.',
            ]);
        }

        $encodedImage = preg_replace('/\s+/', '', substr($request->string('foto')->toString(), strlen('data:image/png;base64,')));
        $image = base64_decode($encodedImage, true);

        if ($image === false || strlen($image) > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'foto' => 'Foto presensi tidak valid atau terlalu besar.',
            ]);
        }

        $imageInfo = getimagesizefromstring($image);

        if ($imageInfo === false || ($imageInfo['mime'] ?? null) !== 'image/png') {
            throw ValidationException::withMessages([
                'foto' => 'Foto presensi harus berupa PNG yang valid.',
            ]);
        }

        $imageName = 'presensi/'.$pegawai->id.'/masuk_'.now()->format('YmdHisv').'_'.bin2hex(random_bytes(8)).'.png';
        $disk = Storage::disk('local');

        if (! $disk->put($imageName, $image)) {
            throw new \RuntimeException('Foto presensi gagal disimpan.');
        }

        try {
            DB::transaction(function () use ($pegawai, $tanggalMasuk, $imageName, $request, $jarakMeter): void {
                if (Presensi::where('id_pegawai', $pegawai->id)
                    ->whereDate('tanggal_masuk', $tanggalMasuk)
                    ->lockForUpdate()
                    ->exists()) {
                    throw ValidationException::withMessages([
                        'presensi' => 'Presensi masuk untuk hari ini sudah tercatat.',
                    ]);
                }

                Presensi::create([
                    'id_pegawai' => $pegawai->id,
                    'tanggal_masuk' => $tanggalMasuk,
                    'jam_masuk' => now()->format('H:i:s'),
                    'foto_masuk' => $imageName,
                    'latitude_masuk' => $request->float('latitude'),
                    'longitude_masuk' => $request->float('longitude'),
                    'jarak_masuk_meter' => $jarakMeter,
                ]);
            });
        } catch (\Throwable $exception) {
            $disk->delete($imageName);

            throw $exception;
        }

        return redirect()->back()->with('success', 'Presensi masuk berhasil!');
    }

    public function storePulang(Request $request): RedirectResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'foto' => ['required', 'string', 'max:6990507', 'regex:/^data:image\/png;base64,[A-Za-z0-9+\/=\r\n]+$/'],
        ]);

        $pegawai = $request->user()->pegawai;

        if ($pegawai === null) {
            abort(403, 'Akun belum terhubung ke data pegawai.');
        }

        $lokasi = $pegawai->lokasiPresensi;

        if ($lokasi === null) {
            throw ValidationException::withMessages([
                'lokasi' => 'Lokasi presensi pegawai belum dikonfigurasi.',
            ]);
        }

        $jarakMeter = GeoHelper::calculateDistance(
            $request->float('latitude'),
            $request->float('longitude'),
            $lokasi->latitude,
            $lokasi->longitude,
        );

        if ($jarakMeter > $lokasi->radius) {
            throw ValidationException::withMessages([
                'latitude' => "Anda berada di luar radius lokasi presensi (Jarak: {$jarakMeter}m, Maksimal: {$lokasi->radius}m).",
            ]);
        }

        $today = now()->toDateString();
        $presensi = Presensi::where('id_pegawai', $pegawai->id)
            ->whereDate('tanggal_masuk', $today)
            ->first();

        if ($presensi === null) {
            throw ValidationException::withMessages([
                'presensi' => 'Anda belum melakukan presensi masuk hari ini.',
            ]);
        }

        if ($presensi->jam_keluar !== null) {
            throw ValidationException::withMessages([
                'presensi' => 'Presensi pulang untuk hari ini sudah tercatat.',
            ]);
        }

        $encodedImage = preg_replace('/\s+/', '', substr($request->string('foto')->toString(), strlen('data:image/png;base64,')));
        $image = base64_decode($encodedImage, true);

        if ($image === false || strlen($image) > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'foto' => 'Foto presensi tidak valid atau terlalu besar.',
            ]);
        }

        $imageInfo = getimagesizefromstring($image);

        if ($imageInfo === false || ($imageInfo['mime'] ?? null) !== 'image/png') {
            throw ValidationException::withMessages([
                'foto' => 'Foto presensi harus berupa PNG yang valid.',
            ]);
        }

        $imageName = 'presensi/'.$pegawai->id.'/pulang_'.now()->format('YmdHisv').'_'.bin2hex(random_bytes(8)).'.png';
        $disk = Storage::disk('local');

        if (! $disk->put($imageName, $image)) {
            throw new \RuntimeException('Foto presensi pulang gagal disimpan.');
        }

        try {
            DB::transaction(function () use ($presensi, $imageName, $today): void {
                $presensi->refresh();

                if ($presensi->jam_keluar !== null) {
                    throw ValidationException::withMessages([
                        'presensi' => 'Presensi pulang untuk hari ini sudah tercatat.',
                    ]);
                }

                $presensi->update([
                    'tanggal_keluar' => $today,
                    'jam_keluar' => now()->format('H:i:s'),
                    'foto_keluar' => $imageName,
                ]);
            });
        } catch (\Throwable $exception) {
            $disk->delete($imageName);

            throw $exception;
        }

        return redirect()->back()->with('success', 'Presensi pulang berhasil dicatat!');
    }
}
