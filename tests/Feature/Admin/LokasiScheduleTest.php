<?php

namespace Tests\Feature\Admin;

use App\Models\Jabatan;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LokasiScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_lokasi_index(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->get(route('admin.lokasi.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_lokasi_with_schedule(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->post(route('admin.lokasi.store'), [
            'nama_lokasi' => 'Cabang Bandung',
            'latitude' => -6.917464,
            'longitude' => 107.619123,
            'radius' => 50,
            'alamat_lokasi' => 'Jl. Asia Afrika',
            'tipe_lokasi' => 'Cabang',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:30',
            'jam_pulang' => '17:30',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lokasi_presensi', [
            'nama_lokasi' => 'Cabang Bandung',
            'jam_masuk' => '08:30',
            'jam_pulang' => '17:30',
            'zona_waktu' => 'WIB',
        ]);
    }

    public function test_admin_can_update_lokasi(): void
    {
        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Cabang Awal',
            'latitude' => -6.917464,
            'longitude' => 107.619123,
            'radius' => 50,
            'alamat_lokasi' => 'Jl. Lama',
            'tipe_lokasi' => 'Cabang',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00',
            'jam_pulang' => '17:00',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.lokasi.update', $lokasi->id), [
            'nama_lokasi' => 'Cabang Update',
            'latitude' => -6.917464,
            'longitude' => 107.619123,
            'radius' => 100,
            'alamat_lokasi' => 'Jl. Baru',
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WITA',
            'jam_masuk' => '09:00',
            'jam_pulang' => '18:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lokasi_presensi', [
            'id' => $lokasi->id,
            'nama_lokasi' => 'Cabang Update',
            'zona_waktu' => 'WITA',
            'jam_masuk' => '09:00',
            'jam_pulang' => '18:00',
        ]);
    }

    public function test_admin_cannot_delete_lokasi_with_assigned_employees(): void
    {
        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Kantor Terpakai',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);

        $jabatan = Jabatan::create(['jabatan' => 'Staff']);
        Pegawai::create([
            'nrg' => 'NRG-LOC-TEST',
            'nama' => 'Pegawai Lokasi',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.lokasi.destroy', $lokasi->id));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('lokasi_presensi', ['id' => $lokasi->id]);
    }

    public function test_admin_can_delete_unassigned_lokasi(): void
    {
        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Kantor Kosong',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.lokasi.destroy', $lokasi->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('lokasi_presensi', ['id' => $lokasi->id]);
    }

    public function test_check_absen_calculates_distance_correctly(): void
    {
        $admin = $this->adminUser();
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Kantor Geofence',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 50,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);

        // Inside radius (exact same point)
        $responseInside = $this->actingAs($admin)->postJson(route('admin.lokasi.check-absen'), [
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'lokasi_id' => $lokasi->id,
        ]);
        $responseInside->assertOk()->assertJson(['status' => 'success']);

        // Outside radius (far away)
        $responseOutside = $this->actingAs($admin)->postJson(route('admin.lokasi.check-absen'), [
            'latitude' => -7.200000,
            'longitude' => 110.816666,
            'lokasi_id' => $lokasi->id,
        ]);
        $responseOutside->assertStatus(422)->assertJson(['status' => 'error']);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'status' => 'aktif',
        ]);
    }
}
