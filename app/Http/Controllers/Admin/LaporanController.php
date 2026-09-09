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

class LaporanController extends Controller
{
    public function index(Request $request): Response
    {
        $bulan = (int) $request->input('bulan', date('n'));
        $tahun = (int) $request->input('tahun', date('Y'));
        $hariInput = $request->input('hari');
        $hari = ($hariInput !== null && $hariInput !== '' && $hariInput !== 'all') ? (int) $hariInput : null;

        $request->merge([
            'bulan' => $bulan,
            'tahun' => $tahun,
            'hari' => $hari,
        ]);

        $request->validate([
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer|between:2000,2100',
            'hari' => 'nullable|integer|between:1,31',
        ]);

        $awalBulan = Carbon::create($tahun, $bulan, 1)->startOfMonth();
        $akhirBulan = $awalBulan->copy()->endOfMonth();

        $isCurrentMonth = ($tahun === (int) now()->year && $bulan === (int) now()->month);
        $isPeriodFuture = ($tahun > (int) now()->year || ($tahun === (int) now()->year && $bulan > (int) now()->month));

        if ($hari !== null && $hari > $akhirBulan->day) {
            $hari = $akhirBulan->day;
        }

        if ($hari !== null) {
            $targetDate = Carbon::create($tahun, $bulan, $hari)->startOfDay();
            $startDate = $targetDate->toDateString();
            $endDate = $targetDate->toDateString();

            $isPeriodFuture = $targetDate->isAfter(now()->endOfDay());

            if ($isPeriodFuture) {
                $hariKerja = 0;
            } elseif ($targetDate->isWeekday()) {
                $hariKerja = 1;
            } else {
                $hariKerja = 0;
            }
        } else {
            $startDate = $awalBulan->toDateString();
            $endDate = $akhirBulan->toDateString();

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
        }

        $presensiQuery = Presensi::query();
        $ketidakhadiranQuery = Ketidakhadiran::query()->where('status_pengajuan', 'APPROVED');

        if ($hari !== null) {
            $presensiQuery->whereDate('tanggal_masuk', $startDate);
            $ketidakhadiranQuery->whereDate('tanggal', $startDate);
        } else {
            $presensiQuery->whereDate('tanggal_masuk', '>=', $startDate)
                ->whereDate('tanggal_masuk', '<=', $endDate);
            $ketidakhadiranQuery->whereDate('tanggal', '>=', $startDate)
                ->whereDate('tanggal', '<=', $endDate);
        }

        $allPresensi = $presensiQuery
            ->get(['id', 'id_pegawai', 'tanggal_masuk', 'jam_masuk', 'jam_keluar'])
            ->groupBy('id_pegawai');

        $allKetidakhadiran = $ketidakhadiranQuery
            ->get(['id', 'id_pegawai', 'keterangan', 'deskripsi', 'tanggal'])
            ->groupBy('id_pegawai');

        $rekap = Pegawai::query()
            ->select(['id', 'nrg', 'nama', 'id_jabatan', 'lokasi_presensi_id', 'created_at'])
            ->with(['jabatan:id,jabatan', 'lokasiPresensi:id,jam_masuk'])
            ->withMin('presensi as first_presensi', 'tanggal_masuk')
            ->withMin('ketidakhadiran as first_izin', 'tanggal')
            ->orderBy('nama')
            ->paginate(25)
            ->withQueryString()
            ->through(function (Pegawai $pegawai) use ($allPresensi, $allKetidakhadiran, $hariKerja, $isPeriodFuture, $hari, $awalBulan, $akhirBulan, $isCurrentMonth): array {
                $presensiList = $allPresensi->get($pegawai->id, collect());
                $izinList = $allKetidakhadiran->get($pegawai->id, collect());

                $dates = collect([
                    $pegawai->created_at ? $pegawai->created_at->format('Y-m-d') : null,
                    $pegawai->first_presensi,
                    $pegawai->first_izin,
                ])->filter();

                $pegawaiStart = $dates->isNotEmpty()
                    ? Carbon::parse($dates->min())->startOfDay()
                    : ($pegawai->created_at ? $pegawai->created_at->copy()->startOfDay() : $awalBulan->copy());

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

                $totalPresensi = $presensiList->count();
                $totalIzin = $izinList->filter(fn ($i) => in_array(strtolower($i->keterangan), ['izin', 'cuti'], true))->count();
                $totalSakit = $izinList->filter(fn ($i) => strtolower($i->keterangan) === 'sakit')->count();

                if ($hari !== null) {
                    $targetDate = Carbon::create($awalBulan->year, $awalBulan->month, $hari)->startOfDay();
                    $isBeforeJoin = $pegawaiStart && $targetDate->isBefore($pegawaiStart);
                    $totalAlpa = ($isPeriodFuture || $hariKerja === 0 || $isBeforeJoin) ? 0 : max(0, $hariKerja - $totalPresensi - $totalIzin - $totalSakit);
                } else {
                    if ($isPeriodFuture || ($pegawaiStart && $pegawaiStart->isAfter($akhirBulan))) {
                        $hariKerjaPegawai = 0;
                    } else {
                        $effectiveStart = ($pegawaiStart && $pegawaiStart->isAfter($awalBulan))
                            ? $pegawaiStart->copy()
                            : $awalBulan->copy();

                        $effectiveEnd = $isCurrentMonth
                            ? min(now()->startOfDay(), $akhirBulan)
                            : $akhirBulan->copy();

                        if ($effectiveStart->isAfter($effectiveEnd)) {
                            $hariKerjaPegawai = 0;
                        } else {
                            $hariKerjaPegawai = 0;
                            $cursor = $effectiveStart->copy();
                            while ($cursor->lte($effectiveEnd)) {
                                if ($cursor->isWeekday()) {
                                    $hariKerjaPegawai++;
                                }
                                $cursor->addDay();
                            }
                        }
                    }
                    $totalAlpa = ($isPeriodFuture || $hariKerjaPegawai === 0) ? 0 : max(0, $hariKerjaPegawai - $totalPresensi - $totalIzin - $totalSakit);
                }

                $detailHarian = null;
                if ($hari !== null) {
                    $targetDate = Carbon::create($awalBulan->year, $awalBulan->month, $hari)->startOfDay();
                    $isBeforeJoin = $pegawaiStart && $targetDate->isBefore($pegawaiStart);

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
                    } elseif ($hariKerja == 1 && ! $isPeriodFuture) {
                        $status = 'Alpa';
                        $keterangan = 'Tidak hadir tanpa keterangan';
                    } elseif (! $isPeriodFuture) {
                        $status = 'Libur';
                        $keterangan = 'Hari libur / non-kerja';
                    } else {
                        $status = '-';
                        $keterangan = 'Periode belum berlangsung';
                    }

                    $detailHarian = [
                        'jam_masuk' => $p?->jam_masuk ? Carbon::parse($p->jam_masuk)->format('H:i') : '-',
                        'jam_keluar' => $p?->jam_keluar ? Carbon::parse($p->jam_keluar)->format('H:i') : '-',
                        'status' => $status,
                        'keterangan' => $keterangan,
                    ];
                }

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
                    'detail_harian' => $detailHarian,
                ];
            });

        return Inertia::render('Admin/Laporan', [
            'rekap' => $rekap,
            'filters' => [
                'bulan' => str_pad((string) $bulan, 2, '0', STR_PAD_LEFT),
                'tahun' => (string) $tahun,
                'hari' => $hari ? str_pad((string) $hari, 2, '0', STR_PAD_LEFT) : '',
            ],
        ]);
    }
}
