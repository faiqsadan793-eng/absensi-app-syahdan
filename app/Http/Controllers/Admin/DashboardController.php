<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ketidakhadiran;
use App\Models\Pegawai;
use App\Models\Presensi;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->format('Y-m-d');

        return Inertia::render('Admin/Dashboard', [
            'totalPegawai' => Pegawai::count(),
            'hadirHariIni' => Presensi::whereDate('tanggal_masuk', $today)->count(),
            'izinPending' => Ketidakhadiran::where('status_pengajuan', 'PENDING')->count(),
            'aktivitasTerbaru' => Presensi::query()
                ->whereDate('tanggal_masuk', $today)
                ->with(['pegawai:id,nama'])
                ->latest('jam_masuk')
                ->limit(5)
                ->get(['id', 'id_pegawai', 'jam_masuk', 'foto_masuk'])
                ->map(fn (Presensi $presensi): array => [
                    'id' => $presensi->id,
                    'nama' => $presensi->pegawai?->nama ?? 'Pegawai tidak ditemukan',
                    'jam_masuk' => $presensi->jam_masuk,
                    'foto_masuk' => $presensi->foto_masuk,
                ]),
        ]);
    }
}
