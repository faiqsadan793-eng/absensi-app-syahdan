<?php

namespace Tests\Feature\Admin;

use App\Models\Jabatan;
use App\Models\Ketidakhadiran;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\Presensi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LaporanCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_monthly_report_calculates_lateness_and_absence_accurately(): void
    {
        // Fix test time to a Wednesday in the middle of the month
        Carbon::setTestNow(Carbon::create(2026, 6, 17, 12, 0, 0)); // Wednesday

        $admin = $this->adminUser();

        // Kantor with jam_masuk = 08:30:00
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Kantor Pusat',
            'latitude' => 0,
            'longitude' => 0,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:30:00',
            'jam_pulang' => '17:00:00',
        ]);

        $jabatan = Jabatan::create(['jabatan' => 'Staff Accounting']);

        $pegawai = Pegawai::create([
            'nrg' => 'NRG-LAPORAN',
            'nama' => 'Pegawai Laporan',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        // 1. On time presensi (08:15 <= 08:30)
        Presensi::create([
            'id_pegawai' => $pegawai->id,
            'tanggal_masuk' => '2026-06-01',
            'jam_masuk' => '08:15:00',
            'foto_masuk' => 'presensi/masuk/1.jpg',
        ]);

        // 2. Late presensi (08:45 > 08:30)
        Presensi::create([
            'id_pegawai' => $pegawai->id,
            'tanggal_masuk' => '2026-06-02',
            'jam_masuk' => '08:45:00',
            'foto_masuk' => 'presensi/masuk/2.jpg',
        ]);

        // 3. Approved Sakit
        Ketidakhadiran::create([
            'id_pegawai' => $pegawai->id,
            'keterangan' => 'Sakit',
            'tanggal' => '2026-06-03',
            'deskripsi' => 'Demam',
            'status_pengajuan' => 'APPROVED',
        ]);

        // 4. Approved Izin
        Ketidakhadiran::create([
            'id_pegawai' => $pegawai->id,
            'keterangan' => 'Izin',
            'tanggal' => '2026-06-04',
            'deskripsi' => 'Keperluan keluarga',
            'status_pengajuan' => 'APPROVED',
        ]);

        // 5. PENDING Izin (should NOT be counted as approved leave)
        Ketidakhadiran::create([
            'id_pegawai' => $pegawai->id,
            'keterangan' => 'Izin',
            'tanggal' => '2026-06-05',
            'deskripsi' => 'Acara',
            'status_pengajuan' => 'PENDING',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.laporan-bulanan.index', [
            'bulan' => 6,
            'tahun' => 2026,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanBulanan')
            ->has('rekap.data', 1)
            ->where('rekap.data.0.total_hadir', 1)
            ->where('rekap.data.0.total_terlambat', 1)
            ->where('rekap.data.0.total_sakit', 1)
            ->where('rekap.data.0.total_izin', 1)
        );

        Carbon::setTestNow(); // Reset mock time
    }

    public function test_future_month_has_zero_alpa(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 6, 17, 12, 0, 0));

        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Pusat',
            'latitude' => 0,
            'longitude' => 0,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);
        $jabatan = Jabatan::create(['jabatan' => 'Staff']);
        Pegawai::create([
            'nrg' => 'NRG-FUTURE',
            'nama' => 'Pegawai Masa Depan',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        // Request next month (July 2026)
        $response = $this->actingAs($admin)->get(route('admin.laporan-bulanan.index', [
            'bulan' => 7,
            'tahun' => 2026,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanBulanan')
            ->where('rekap.data.0.total_alpa', 0)
        );

        Carbon::setTestNow();
    }

    public function test_daily_report_filters_by_specific_date(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 6, 17, 12, 0, 0)); // Wednesday

        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Kantor Utama',
            'latitude' => 0,
            'longitude' => 0,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);
        $jabatan = Jabatan::create(['jabatan' => 'Developer']);
        $pegawai = Pegawai::create([
            'nrg' => 'NRG-DAY-TEST',
            'nama' => 'Pegawai Filter Hari',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567891',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        // June 1: On time
        Presensi::create([
            'id_pegawai' => $pegawai->id,
            'tanggal_masuk' => '2026-06-01',
            'jam_masuk' => '07:55:00',
            'foto_masuk' => 'presensi/masuk/day1.jpg',
        ]);

        // June 2: Terlambat
        Presensi::create([
            'id_pegawai' => $pegawai->id,
            'tanggal_masuk' => '2026-06-02',
            'jam_masuk' => '08:20:00',
            'foto_masuk' => 'presensi/masuk/day2.jpg',
        ]);

        // Filter Day 1 (2026-06-01)
        $responseDay1 = $this->actingAs($admin)->get(route('admin.laporan-harian.index', [
            'tanggal' => '2026-06-01',
        ]));

        $responseDay1->assertOk();
        $responseDay1->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanHarian')
            ->where('filters.tanggal', '2026-06-01')
            ->where('ringkasan.total_hadir', 1)
            ->where('ringkasan.total_terlambat', 0)
            ->where('ringkasan.total_alpa', 0)
            ->where('laporan.data.0.status', 'Hadir')
            ->where('laporan.data.0.jam_masuk', '07:55')
        );

        // Filter Day 2 (2026-06-02)
        $responseDay2 = $this->actingAs($admin)->get(route('admin.laporan-harian.index', [
            'tanggal' => '2026-06-02',
        ]));

        $responseDay2->assertOk();
        $responseDay2->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanHarian')
            ->where('filters.tanggal', '2026-06-02')
            ->where('ringkasan.total_hadir', 0)
            ->where('ringkasan.total_terlambat', 1)
            ->where('ringkasan.total_alpa', 0)
            ->where('laporan.data.0.status', 'Terlambat')
            ->where('laporan.data.0.jam_masuk', '08:20')
        );

        // Filter Day 10 (2026-06-10 - Wednesday, no presensi / leave -> Alpa = 1)
        $responseDay10 = $this->actingAs($admin)->get(route('admin.laporan-harian.index', [
            'tanggal' => '2026-06-10',
        ]));

        $responseDay10->assertOk();
        $responseDay10->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanHarian')
            ->where('filters.tanggal', '2026-06-10')
            ->where('ringkasan.total_hadir', 0)
            ->where('ringkasan.total_terlambat', 0)
            ->where('ringkasan.total_alpa', 1)
            ->where('laporan.data.0.status', 'Alpa')
        );

        // Filter Day 7 (2026-06-07 - Sunday, weekend -> Libur)
        $responseDay7 = $this->actingAs($admin)->get(route('admin.laporan-harian.index', [
            'tanggal' => '2026-06-07',
        ]));

        $responseDay7->assertOk();
        $responseDay7->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanHarian')
            ->where('filters.tanggal', '2026-06-07')
            ->where('ringkasan.total_alpa', 0)
            ->where('ringkasan.is_libur', true)
            ->where('laporan.data.0.status', 'Libur')
        );

        Carbon::setTestNow();
    }

    public function test_monthly_report_past_month_before_employee_registered_has_zero_alpa(): void
    {
        // System time is September 2026
        Carbon::setTestNow(Carbon::create(2026, 9, 8, 12, 0, 0));

        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Pusat',
            'latitude' => 0,
            'longitude' => 0,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);
        $jabatan = Jabatan::create(['jabatan' => 'Staff']);
        Pegawai::create([
            'nrg' => 'NRG-SEPTEMBER',
            'nama' => 'Pegawai Baru September',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        // Request past month (January 2026 - month before employee was created)
        $response = $this->actingAs($admin)->get(route('admin.laporan-bulanan.index', [
            'bulan' => 1,
            'tahun' => 2026,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanBulanan')
            ->where('rekap.data.0.total_alpa', 0)
            ->where('ringkasan.total_alpa', 0)
        );

        Carbon::setTestNow();
    }

    public function test_daily_report_before_employee_registered_shows_unregistered_and_zero_alpa(): void
    {
        // System time is September 2026
        Carbon::setTestNow(Carbon::create(2026, 9, 8, 12, 0, 0));

        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Pusat',
            'latitude' => 0,
            'longitude' => 0,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);
        $jabatan = Jabatan::create(['jabatan' => 'Staff']);
        Pegawai::create([
            'nrg' => 'NRG-SEPTEMBER-2',
            'nama' => 'Pegawai Baru September 2',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        // Query date in January 2026
        $response = $this->actingAs($admin)->get(route('admin.laporan-harian.index', [
            'tanggal' => '2026-01-15',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LaporanHarian')
            ->where('ringkasan.total_alpa', 0)
            ->where('laporan.data.0.status', '-')
            ->where('laporan.data.0.keterangan', 'Pegawai belum terdaftar pada tanggal ini')
        );

        Carbon::setTestNow();
    }

    private function adminUser(): User
    {
        /** @var User $user */
        $user = User::factory()->create([
            'role' => 'admin',
            'status' => 'aktif',
        ]);

        return $user;
    }
}
