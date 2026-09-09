<?php

namespace Tests\Feature\Pegawai;

use App\Models\Ketidakhadiran;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\Presensi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KetidakhadiranConflictTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_cannot_submit_absence_if_attendance_exists_on_same_date(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();
        $date = '2026-09-10';

        Presensi::create([
            'id_pegawai' => $user->pegawai_id,
            'tanggal_masuk' => $date,
            'jam_masuk' => '08:00:00',
            'foto_masuk' => 'presensi/sample.png',
        ]);

        $response = $this->actingAs($user)->post(route('pegawai.ketidakhadiran.store'), [
            'keterangan' => 'Izin',
            'tanggal' => $date,
            'deskripsi' => 'Keperluan mendadak',
        ]);

        $response->assertSessionHasErrors('tanggal');
    }

    public function test_employee_cannot_submit_duplicate_absence_on_same_date(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();
        $date = '2026-09-10';

        Ketidakhadiran::create([
            'id_pegawai' => $user->pegawai_id,
            'keterangan' => 'Izin',
            'tanggal' => $date,
            'deskripsi' => 'Pengajuan pertama',
            'status_pengajuan' => 'PENDING',
        ]);

        $response = $this->actingAs($user)->post(route('pegawai.ketidakhadiran.store'), [
            'keterangan' => 'Sakit',
            'tanggal' => $date,
            'deskripsi' => 'Pengajuan kedua di tanggal sama',
        ]);

        $response->assertSessionHasErrors('tanggal');
    }

    public function test_employee_can_stream_own_absence_file(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        $file = UploadedFile::fake()->create('surat_dokter.pdf', 150, 'application/pdf');
        $filePath = $file->store('ketidakhadiran', 'local');

        $izin = Ketidakhadiran::create([
            'id_pegawai' => $user->pegawai_id,
            'keterangan' => 'Sakit',
            'tanggal' => '2026-09-10',
            'deskripsi' => 'Demam',
            'file' => $filePath,
            'status_pengajuan' => 'PENDING',
        ]);

        $response = $this->actingAs($user)->get(route('pegawai.ketidakhadiran.file', $izin));
        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    private function employeeUser(): User
    {
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

        $pegawai = Pegawai::create([
            'nrg' => 'NRG-001',
            'nama' => 'Pegawai Test',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat Test',
            'no_handphone' => '081234567890',
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        return User::factory()->create([
            'pegawai_id' => $pegawai->id,
            'role' => 'pegawai',
            'status' => 'aktif',
        ]);
    }
}
