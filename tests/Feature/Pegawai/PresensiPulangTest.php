<?php

namespace Tests\Feature\Pegawai;

use App\Models\Ketidakhadiran;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\Presensi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PresensiPulangTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    public function test_employee_can_submit_presensi_pulang(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        // Absen masuk
        $this->actingAs($user)->post(route('pegawai.presensi.masuk'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ]);

        $this->assertDatabaseHas('presensi', [
            'id_pegawai' => $user->pegawai_id,
            'jam_keluar' => null,
        ]);

        // Absen pulang
        $response = $this->actingAs($user)->post(route('pegawai.presensi.pulang'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Presensi pulang berhasil dicatat!');

        $presensi = Presensi::where('id_pegawai', $user->pegawai_id)->first();
        $this->assertNotNull($presensi->jam_keluar);
        $this->assertTrue(Storage::disk('local')->exists($presensi->foto_keluar));
    }

    public function test_employee_cannot_submit_presensi_pulang_if_not_clocked_in(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        $response = $this->actingAs($user)->post(route('pegawai.presensi.pulang'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ]);

        $response->assertSessionHasErrors('presensi');
    }

    public function test_employee_cannot_submit_presensi_pulang_twice(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        // Absen masuk
        $this->actingAs($user)->post(route('pegawai.presensi.masuk'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ]);

        // Absen pulang ke-1
        $this->actingAs($user)->post(route('pegawai.presensi.pulang'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ])->assertRedirect();

        // Absen pulang ke-2
        $response = $this->actingAs($user)->post(route('pegawai.presensi.pulang'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ]);

        $response->assertSessionHasErrors('presensi');
    }

    public function test_employee_cannot_submit_presensi_if_approved_absence_exists_today(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        Ketidakhadiran::create([
            'id_pegawai' => $user->pegawai_id,
            'keterangan' => 'Sakit',
            'tanggal' => now()->toDateString(),
            'deskripsi' => 'Demam',
            'status_pengajuan' => 'APPROVED',
        ]);

        $response = $this->actingAs($user)->post(route('pegawai.presensi.masuk'), [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ]);

        $response->assertSessionHasErrors('presensi');
        $this->assertDatabaseCount('presensi', 0);
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
