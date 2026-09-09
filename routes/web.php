<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\JabatanController;
use App\Http\Controllers\Admin\LaporanBulananController;
use App\Http\Controllers\Admin\LaporanHarianController;
use App\Http\Controllers\Admin\LokasiController;
use App\Http\Controllers\Admin\PegawaiController;
use App\Http\Controllers\Admin\PersetujuanIzinController;
use App\Http\Controllers\Admin\RiwayatPresensiController;
use App\Http\Controllers\Pegawai\KetidakhadiranController;
use App\Http\Controllers\Pegawai\PresensiController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// ROUTE DENGAN AUTENTIKASI MASUK
Route::middleware(['auth'])->group(function () {

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', function (Request $request) {
        return redirect()->route($request->user()?->role === 'admin' ? 'admin.dashboard' : 'pegawai.dashboard');
    })->name('dashboard');

    // === ROLE ADMIN ===
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
        Route::resource('/pegawai', PegawaiController::class);
        Route::resource('/jabatan', JabatanController::class);
        Route::post('/lokasi/check-absen', [LokasiController::class, 'checkAbsen'])->name('lokasi.check-absen');
        Route::resource('/lokasi', LokasiController::class);
        Route::get('/riwayat-presensi', [RiwayatPresensiController::class, 'index'])->name('riwayat.index');
        Route::get('/riwayat-presensi/{presensi}/foto/{jenis}', [RiwayatPresensiController::class, 'foto'])->name('riwayat.foto');
        Route::get('/izin', [PersetujuanIzinController::class, 'index'])->name('izin.index');
        Route::get('/izin/{id}/file', [PersetujuanIzinController::class, 'file'])->name('izin.file');
        Route::put('/izin/{id}/status', [PersetujuanIzinController::class, 'updateStatus'])->name('izin.update-status');
        Route::get('/laporan-harian', [LaporanHarianController::class, 'index'])->name('laporan-harian.index');
        Route::get('/laporan-bulanan', [LaporanBulananController::class, 'index'])->name('laporan-bulanan.index');
        Route::get('/laporan', [LaporanBulananController::class, 'index'])->name('laporan.index');
    });

    // === ROLE PEGAWAI ===
    Route::middleware(['role:pegawai'])->prefix('pegawai')->name('pegawai.')->group(function () {
        Route::get('/dashboard', [PresensiController::class, 'index'])->name('dashboard');
        Route::post('/presensi/masuk', [PresensiController::class, 'storeMasuk'])->name('presensi.masuk');
        Route::post('/presensi/pulang', [PresensiController::class, 'storePulang'])->name('presensi.pulang');
        Route::get('/ketidakhadiran/{ketidakhadiran}/file', [KetidakhadiranController::class, 'file'])->name('ketidakhadiran.file');
        Route::resource('/ketidakhadiran', KetidakhadiranController::class);
    });
});

require __DIR__.'/auth.php';
