<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ketidakhadiran;
use App\Models\Pegawai;
use App\Models\Presensi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanHarianController extends Controller
{
    public function index(Request $request): Response
    {
        $tanggalInput = $request->input('tanggal', now()->toDateString());

        $request->merge(['tanggal' => $tanggalInput]);
        $request->validate([
            'tanggal' => 'required|date',
        ]);

        $targetDate = Carbon::parse($tanggalInput)->startOfDay();
        $dateString = $targetDate->toDateString();
        $isPeriodFuture = $targetDate->isAfter(now()->endOfDay());
        $isWeekday = $targetDate->isWeekday();

        $allPresensi = Presensi::query()
            ->whereDate('tanggal_masuk', $dateString)
            ->get(['id', 'id_pegawai', 'tanggal_masuk', 'jam_masuk', 'jam_keluar'])
            ->groupBy('id_pegawai');

        $allKetidakhadiran = Ketidakhadiran::query()
            ->where('status_pengajuan', 'APPROVED')
            ->whereDate('tanggal', $dateString)
            ->get(['id', 'id_pegawai', 'keterangan', 'deskripsi', 'tanggal'])
            ->groupBy('id_pegawai');

        $semuaPegawai = Pegawai::query()
            ->with(['jabatan:id,jabatan', 'lokasiPresensi:id,jam_masuk'])
            ->withMin('presensi as first_presensi', 'tanggal_masuk')
            ->withMin('ketidakhadiran as first_izin', 'tanggal')
            ->orderBy('nama')
            ->get(['id', 'nrg', 'nama', 'id_jabatan', 'lokasi_presensi_id', 'created_at']);

        // Hitung total ringkasan untuk seluruh pegawai
        $totalHadir = 0;
        $totalTerlambat = 0;
        $totalIzin = 0;
        $totalSakit = 0;
        $totalAlpa = 0;

        foreach ($semuaPegawai as $pegawai) {
            $presensiList = $allPresensi->get($pegawai->id, collect());
            $izinList = $allKetidakhadiran->get($pegawai->id, collect());

            $dates = collect([
                $pegawai->created_at ? $pegawai->created_at->format('Y-m-d') : null,
                $pegawai->first_presensi,
                $pegawai->first_izin,
            ])->filter();

            $pegawaiStart = $dates->isNotEmpty()
                ? Carbon::parse($dates->min())->startOfDay()
                : ($pegawai->created_at ? $pegawai->created_at->copy()->startOfDay() : null);

            $isBeforeJoin = $pegawaiStart && $targetDate->isBefore($pegawaiStart);

            $jamMasukKantor = $pegawai->lokasiPresensi?->jam_masuk
                ? Carbon::parse($pegawai->lokasiPresensi->jam_masuk)->format('H:i:s')
                : '08:00:00';

            $p = $presensiList->first();
            $iz = $izinList->first();

            if ($p) {
                $isOntime = Carbon::parse($p->jam_masuk)->format('H:i:s') <= $jamMasukKantor;
                if ($isOntime) {
                    $totalHadir++;
                } else {
                    $totalTerlambat++;
                }
            } elseif ($iz) {
                if (strtolower($iz->keterangan) === 'sakit') {
                    $totalSakit++;
                } else {
                    $totalIzin++;
                }
            } elseif ($isWeekday && ! $isPeriodFuture && ! $isBeforeJoin) {
                $totalAlpa++;
            }
        }

        $laporan = Pegawai::query()
            ->select(['id', 'nrg', 'nama', 'id_jabatan', 'lokasi_presensi_id', 'created_at'])
            ->with(['jabatan:id,jabatan', 'lokasiPresensi:id,jam_masuk'])
            ->withMin('presensi as first_presensi', 'tanggal_masuk')
            ->withMin('ketidakhadiran as first_izin', 'tanggal')
            ->orderBy('nama')
            ->paginate(25)
            ->withQueryString()
            ->through(function (Pegawai $pegawai) use ($allPresensi, $allKetidakhadiran, $isPeriodFuture, $isWeekday, $targetDate): array {
                $presensiList = $allPresensi->get($pegawai->id, collect());
                $izinList = $allKetidakhadiran->get($pegawai->id, collect());

                $dates = collect([
                    $pegawai->created_at ? $pegawai->created_at->format('Y-m-d') : null,
                    $pegawai->first_presensi,
                    $pegawai->first_izin,
                ])->filter();

                $pegawaiStart = $dates->isNotEmpty()
                    ? Carbon::parse($dates->min())->startOfDay()
                    : ($pegawai->created_at ? $pegawai->created_at->copy()->startOfDay() : null);

                $isBeforeJoin = $pegawaiStart && $targetDate->isBefore($pegawaiStart);

                $jamMasukKantor = $pegawai->lokasiPresensi?->jam_masuk
                    ? Carbon::parse($pegawai->lokasiPresensi->jam_masuk)->format('H:i:s')
                    : '08:00:00';

                $p = $presensiList->first();
                $iz = $izinList->first();

                $status = '-';
                $keterangan = '-';

                if ($p) {
                    $isOntime = Carbon::parse($p->jam_masuk)->format('H:i:s') <= $jamMasukKantor;
                    $status = $isOntime ? 'Hadir' : 'Terlambat';
                    $keterangan = $isOntime ? 'Masuk tepat waktu' : 'Terlambat hadir';
                } elseif ($iz) {
                    $status = strtolower($iz->keterangan) === 'sakit' ? 'Sakit' : 'Izin';
                    $keterangan = $iz->deskripsi ?: $iz->keterangan;
                } elseif ($isBeforeJoin && ! $isPeriodFuture) {
                    $status = '-';
                    $keterangan = 'Pegawai belum terdaftar pada tanggal ini';
                } elseif ($isWeekday && ! $isPeriodFuture) {
                    $status = 'Alpa';
                    $keterangan = 'Tidak hadir tanpa keterangan';
                } elseif (! $isPeriodFuture) {
                    $status = 'Libur';
                    $keterangan = 'Hari libur / non-kerja';
                } else {
                    $status = '-';
                    $keterangan = 'Periode belum berlangsung';
                }

                return [
                    'id' => $pegawai->id,
                    'nrg' => $pegawai->nrg,
                    'nama' => $pegawai->nama,
                    'jabatan' => $pegawai->jabatan?->jabatan ?? '-',
                    'jam_masuk' => $p?->jam_masuk ? Carbon::parse($p->jam_masuk)->format('H:i') : '-',
                    'jam_keluar' => $p?->jam_keluar ? Carbon::parse($p->jam_keluar)->format('H:i') : '-',
                    'status' => $status,
                    'keterangan' => $keterangan,
                ];
            });

        return Inertia::render('Admin/LaporanHarian', [
            'laporan' => $laporan,
            'filters' => [
                'tanggal' => $dateString,
            ],
            'ringkasan' => [
                'total_hadir' => $totalHadir,
                'total_terlambat' => $totalTerlambat,
                'total_izin' => $totalIzin,
                'total_sakit' => $totalSakit,
                'total_alpa' => $totalAlpa,
                'is_libur' => ! $isWeekday,
                'is_future' => $isPeriodFuture,
            ],
        ]);
    }
}
