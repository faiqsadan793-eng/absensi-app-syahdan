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

class LaporanBulananController extends Controller
{
    public function index(Request $request): Response
    {
        $bulan = (int) $request->input('bulan', date('n'));
        $tahun = (int) $request->input('tahun', date('Y'));

        $request->merge([
            'bulan' => $bulan,
            'tahun' => $tahun,
        ]);

        $request->validate([
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer|between:2000,2100',
        ]);

        $awalBulan = Carbon::create($tahun, $bulan, 1)->startOfMonth();
        $akhirBulan = $awalBulan->copy()->endOfMonth();
        $startDate = $awalBulan->toDateString();
        $endDate = $akhirBulan->toDateString();

        $isCurrentMonth = ($tahun === (int) now()->year && $bulan === (int) now()->month);
        $isPeriodFuture = ($tahun > (int) now()->year || ($tahun === (int) now()->year && $bulan > (int) now()->month));

        if ($isPeriodFuture) {
            $hariKerja = 0;
        } elseif ($isCurrentMonth) {
            $hariKerja = collect(range(1, min(now()->day, $akhirBulan->day)))
                ->map(fn ($h) => $awalBulan->copy()->day($h))
                ->filter(fn (Carbon $tanggal) => $tanggal->isWeekday())
                ->count();
        } else {
            $hariKerja = collect(range(1, $akhirBulan->day))
                ->map(fn ($h) => $awalBulan->copy()->day($h))
                ->filter(fn (Carbon $tanggal) => $tanggal->isWeekday())
                ->count();
        }

        $allPresensi = Presensi::query()
            ->whereDate('tanggal_masuk', '>=', $startDate)
            ->whereDate('tanggal_masuk', '<=', $endDate)
            ->get(['id', 'id_pegawai', 'tanggal_masuk', 'jam_masuk', 'jam_keluar'])
            ->groupBy('id_pegawai');

        $allKetidakhadiran = Ketidakhadiran::query()
            ->where('status_pengajuan', 'APPROVED')
            ->whereDate('tanggal', '>=', $startDate)
            ->whereDate('tanggal', '<=', $endDate)
            ->get(['id', 'id_pegawai', 'keterangan', 'deskripsi', 'tanggal'])
            ->groupBy('id_pegawai');

        $resolvePegawaiStart = function (Pegawai $pegawai) use ($awalBulan): ?Carbon {
            $dates = collect([
                $pegawai->created_at ? $pegawai->created_at->format('Y-m-d') : null,
                $pegawai->first_presensi,
                $pegawai->first_izin,
            ])->filter();

            return $dates->isNotEmpty()
                ? Carbon::parse($dates->min())->startOfDay()
                : ($pegawai->created_at ? $pegawai->created_at->copy()->startOfDay() : $awalBulan->copy());
        };

        $hitungAlpaPegawai = function (Pegawai $pegawai, $presensiList, $izinList) use ($awalBulan, $akhirBulan, $isCurrentMonth, $isPeriodFuture, $resolvePegawaiStart): int {
            if ($isPeriodFuture) {
                return 0;
            }

            $pegawaiStart = $resolvePegawaiStart($pegawai);

            if ($pegawaiStart && $pegawaiStart->isAfter($akhirBulan)) {
                return 0;
            }

            $effectiveStart = ($pegawaiStart && $pegawaiStart->isAfter($awalBulan))
                ? $pegawaiStart->copy()
                : $awalBulan->copy();

            $effectiveEnd = $isCurrentMonth
                ? min(now()->startOfDay(), $akhirBulan)
                : $akhirBulan->copy();

            if ($effectiveStart->isAfter($effectiveEnd)) {
                return 0;
            }

            $hariKerjaPegawai = 0;
            $cursor = $effectiveStart->copy();
            while ($cursor->lte($effectiveEnd)) {
                if ($cursor->isWeekday()) {
                    $hariKerjaPegawai++;
                }
                $cursor->addDay();
            }

            $totalPresensi = $presensiList->count();
            $totalIzin = $izinList->filter(fn ($i) => in_array(strtolower($i->keterangan), ['izin', 'cuti'], true))->count();
            $totalSakit = $izinList->filter(fn ($i) => strtolower($i->keterangan) === 'sakit')->count();

            return max(0, $hariKerjaPegawai - $totalPresensi - $totalIzin - $totalSakit);
        };

        $semuaPegawai = Pegawai::query()
            ->with(['jabatan:id,jabatan', 'lokasiPresensi:id,jam_masuk'])
            ->withMin('presensi as first_presensi', 'tanggal_masuk')
            ->withMin('ketidakhadiran as first_izin', 'tanggal')
            ->orderBy('nama')
            ->get(['id', 'nrg', 'nama', 'id_jabatan', 'lokasi_presensi_id', 'created_at']);

        $totalHadirSemua = 0;
        $totalTerlambatSemua = 0;
        $totalIzinSemua = 0;
        $totalSakitSemua = 0;
        $totalAlpaSemua = 0;

        foreach ($semuaPegawai as $pegawai) {
            $presensiList = $allPresensi->get($pegawai->id, collect());
            $izinList = $allKetidakhadiran->get($pegawai->id, collect());

            $jamMasukKantor = $pegawai->lokasiPresensi?->jam_masuk
                ? Carbon::parse($pegawai->lokasiPresensi->jam_masuk)->format('H:i:s')
                : '08:00:00';

            $totalHadir = 0;
            $totalTerlambat = 0;

            foreach ($presensiList as $p) {
                $jamMasukPresensi = Carbon::parse($p->jam_masuk)->format('H:i:s');
                if ($jamMasukPresensi <= $jamMasukKantor) {
                    $totalHadir++;
                } else {
                    $totalTerlambat++;
                }
            }

            $totalIzin = $izinList->filter(fn ($i) => in_array(strtolower($i->keterangan), ['izin', 'cuti'], true))->count();
            $totalSakit = $izinList->filter(fn ($i) => strtolower($i->keterangan) === 'sakit')->count();
            $totalAlpa = $hitungAlpaPegawai($pegawai, $presensiList, $izinList);

            $totalHadirSemua += $totalHadir;
            $totalTerlambatSemua += $totalTerlambat;
            $totalIzinSemua += $totalIzin;
            $totalSakitSemua += $totalSakit;
            $totalAlpaSemua += $totalAlpa;
        }

        $rekap = Pegawai::query()
            ->select(['id', 'nrg', 'nama', 'id_jabatan', 'lokasi_presensi_id', 'created_at'])
            ->with(['jabatan:id,jabatan', 'lokasiPresensi:id,jam_masuk'])
            ->withMin('presensi as first_presensi', 'tanggal_masuk')
            ->withMin('ketidakhadiran as first_izin', 'tanggal')
            ->orderBy('nama')
            ->paginate(25)
            ->withQueryString()
            ->through(function (Pegawai $pegawai) use ($allPresensi, $allKetidakhadiran, $hitungAlpaPegawai): array {
                $presensiList = $allPresensi->get($pegawai->id, collect());
                $izinList = $allKetidakhadiran->get($pegawai->id, collect());

                $jamMasukKantor = $pegawai->lokasiPresensi?->jam_masuk
                    ? Carbon::parse($pegawai->lokasiPresensi->jam_masuk)->format('H:i:s')
                    : '08:00:00';

                $totalHadir = 0;
                $totalTerlambat = 0;

                foreach ($presensiList as $p) {
                    $jamMasukPresensi = Carbon::parse($p->jam_masuk)->format('H:i:s');
                    if ($jamMasukPresensi <= $jamMasukKantor) {
                        $totalHadir++;
                    } else {
                        $totalTerlambat++;
                    }
                }

                $totalIzin = $izinList->filter(fn ($i) => in_array(strtolower($i->keterangan), ['izin', 'cuti'], true))->count();
                $totalSakit = $izinList->filter(fn ($i) => strtolower($i->keterangan) === 'sakit')->count();
                $totalAlpa = $hitungAlpaPegawai($pegawai, $presensiList, $izinList);

                return [
                    'id' => $pegawai->id,
                    'nrg' => $pegawai->nrg,
                    'nama' => $pegawai->nama,
                    'jabatan' => $pegawai->jabatan?->jabatan ?? '-',
                    'total_hadir' => $totalHadir,
                    'total_terlambat' => $totalTerlambat,
                    'total_izin' => $totalIzin,
                    'total_sakit' => $totalSakit,
                    'total_alpa' => $totalAlpa,
                ];
            });

        return Inertia::render('Admin/LaporanBulanan', [
            'rekap' => $rekap,
            'filters' => [
                'bulan' => str_pad((string) $bulan, 2, '0', STR_PAD_LEFT),
                'tahun' => (string) $tahun,
            ],
            'ringkasan' => [
                'total_hadir' => $totalHadirSemua,
                'total_terlambat' => $totalTerlambatSemua,
                'total_izin' => $totalIzinSemua,
                'total_sakit' => $totalSakitSemua,
                'total_alpa' => $totalAlpaSemua,
                'hari_kerja' => $hariKerja,
            ],
        ]);
    }
}
