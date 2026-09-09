<?php

namespace Tests\Feature\Pegawai;

use App\Models\Jabatan;
use App\Models\Ketidakhadiran;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KetidakhadiranTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_absence_resource(): void
    {
        $response = $this->get(route('pegawai.ketidakhadiran.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_employee_can_submit_absence_for_the_authenticated_employee(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser('NRG-001');

        $response = $this->actingAs($user)->post(route('pegawai.ketidakhadiran.store'), [
            'id_pegawai' => 999999,
            'keterangan' => 'Izin',
            'tanggal' => '2026-09-05',
            'deskripsi' => 'Keperluan keluarga',
            'file' => UploadedFile::fake()->create('surat.pdf', 100, 'application/pdf'),
        ]);

        $response->assertRedirect(route('pegawai.ketidakhadiran.index', absolute: false));
        $this->assertDatabaseHas('ketidakhadiran', [
            'id_pegawai' => $user->pegawai_id,
            'keterangan' => 'Izin',
            'status_pengajuan' => 'PENDING',
        ]);
        $this->assertDatabaseMissing('ketidakhadiran', ['id_pegawai' => 999999]);

        $izin = Ketidakhadiran::firstOrFail();
        Storage::disk('local')->assertExists($izin->file);
    }

    public function test_employee_cannot_read_another_employees_absence(): void
    {
        $owner = $this->employeeUser('NRG-001');
        $otherUser = $this->employeeUser('NRG-002');
        $izin = Ketidakhadiran::create([
            'id_pegawai' => $owner->pegawai_id,
            'keterangan' => 'Sakit',
            'tanggal' => '2026-09-05',
            'deskripsi' => 'Sakit',
            'status_pengajuan' => 'PENDING',
        ]);

        $response = $this->actingAs($otherUser)
            ->get(route('pegawai.ketidakhadiran.show', $izin));

        $response->assertNotFound();
    }

    public function test_employee_cannot_update_another_employees_absence(): void
    {
        $owner = $this->employeeUser('NRG-001');
        $otherUser = $this->employeeUser('NRG-002');
        $izin = Ketidakhadiran::create([
            'id_pegawai' => $owner->pegawai_id,
            'keterangan' => 'Sakit',
            'tanggal' => '2026-09-05',
            'deskripsi' => 'Sakit',
            'status_pengajuan' => 'PENDING',
        ]);

        $response = $this->actingAs($otherUser)
            ->put(route('pegawai.ketidakhadiran.update', $izin), [
                'keterangan' => 'Izin',
                'tanggal' => '2026-09-06',
                'deskripsi' => 'Perubahan tidak sah',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('ketidakhadiran', [
            'id' => $izin->id,
            'id_pegawai' => $owner->pegawai_id,
            'keterangan' => 'Sakit',
        ]);
    }

    private function employeeUser(string $nrg): User
    {
        $jabatan = Jabatan::create(['jabatan' => 'Staff '.$nrg]);
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Lokasi '.$nrg,
            'latitude' => 0,
            'longitude' => 0,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);
        $pegawai = Pegawai::create([
            'nrg' => $nrg,
            'nama' => 'Pegawai '.$nrg,
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        return User::factory()->create([
            'pegawai_id' => $pegawai->id,
            'role' => 'pegawai',
        ]);
    }
}
