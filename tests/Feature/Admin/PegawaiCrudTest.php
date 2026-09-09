<?php

namespace Tests\Feature\Admin;

use App\Models\Jabatan;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\Presensi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PegawaiCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pegawai_index(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->get(route('admin.pegawai.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_new_pegawai_with_user(): void
    {
        $admin = $this->adminUser();
        $jabatan = Jabatan::create(['jabatan' => 'Staff IT']);
        $lokasi = $this->createLokasi();

        $response = $this->actingAs($admin)->post(route('admin.pegawai.store'), [
            'nrg' => 'NRG-999',
            'nama' => 'Budi Baru',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Jl. Merdeka No. 10',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
            'username' => 'budibaru',
            'password' => 'secret123',
            'status' => 'aktif',
        ]);

        $response->assertRedirect(route('admin.pegawai.index'));
        $this->assertDatabaseHas('pegawai', ['nrg' => 'NRG-999', 'nama' => 'Budi Baru']);
        $this->assertDatabaseHas('users', ['username' => 'budibaru', 'role' => 'pegawai', 'status' => 'aktif']);
    }

    public function test_admin_can_update_pegawai_and_user_status(): void
    {
        $admin = $this->adminUser();
        $jabatan1 = Jabatan::create(['jabatan' => 'Staff IT']);
        $jabatan2 = Jabatan::create(['jabatan' => 'Senior IT']);
        $lokasi = $this->createLokasi();

        $pegawai = Pegawai::create([
            'nrg' => 'NRG-100',
            'nama' => 'Pegawai Lama',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat Asal',
            'no_handphone' => '0811111111',
            'id_jabatan' => $jabatan1->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        $user = User::create([
            'pegawai_id' => $pegawai->id,
            'username' => 'pegawailama',
            'password' => bcrypt('password'),
            'role' => 'pegawai',
            'status' => 'aktif',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.pegawai.update', $pegawai), [
            'nrg' => 'NRG-100-EDITED',
            'nama' => 'Pegawai Diperbarui',
            'jenis_kelamin' => 'Perempuan',
            'alamat' => 'Alamat Baru',
            'no_handphone' => '0822222222',
            'id_jabatan' => $jabatan2->id,
            'lokasi_presensi_id' => $lokasi->id,
            'username' => 'pegawailama_updated',
            'status' => 'nonaktif',
        ]);

        $response->assertRedirect(route('admin.pegawai.index'));
        $this->assertDatabaseHas('pegawai', ['id' => $pegawai->id, 'nrg' => 'NRG-100-EDITED', 'nama' => 'Pegawai Diperbarui']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'username' => 'pegawailama_updated', 'status' => 'nonaktif']);
    }

    public function test_inactive_user_is_logged_out_by_role_middleware(): void
    {
        $lokasi = $this->createLokasi();
        $jabatan = Jabatan::create(['jabatan' => 'Staff']);
        $pegawai = Pegawai::create([
            'nrg' => 'NRG-INACTIVE',
            'nama' => 'Akun Nonaktif',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '0833333333',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        $inactiveUser = User::create([
            'pegawai_id' => $pegawai->id,
            'username' => 'inactive_user',
            'password' => bcrypt('password'),
            'role' => 'pegawai',
            'status' => 'nonaktif',
        ]);

        $response = $this->actingAs($inactiveUser)->get(route('pegawai.dashboard'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_admin_cannot_delete_pegawai_with_presence_history(): void
    {
        $admin = $this->adminUser();
        $lokasi = $this->createLokasi();
        $jabatan = Jabatan::create(['jabatan' => 'Staff']);

        $pegawai = Pegawai::create([
            'nrg' => 'NRG-WITH-HISTORY',
            'nama' => 'Pegawai Bersejarah',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '0844444444',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        Presensi::create([
            'id_pegawai' => $pegawai->id,
            'tanggal_masuk' => now()->toDateString(),
            'jam_masuk' => '08:00:00',
            'foto_masuk' => 'presensi/masuk/test.jpg',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.pegawai.destroy', $pegawai));

        $response->assertRedirect(route('admin.pegawai.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('pegawai', ['id' => $pegawai->id]);
    }

    public function test_admin_can_delete_pegawai_without_history(): void
    {
        $admin = $this->adminUser();
        $lokasi = $this->createLokasi();
        $jabatan = Jabatan::create(['jabatan' => 'Staff']);

        $pegawai = Pegawai::create([
            'nrg' => 'NRG-CLEAN',
            'nama' => 'Pegawai Bersih',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Alamat',
            'no_handphone' => '0855555555',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        $user = User::create([
            'pegawai_id' => $pegawai->id,
            'username' => 'clean_pegawai',
            'password' => bcrypt('password'),
            'role' => 'pegawai',
            'status' => 'aktif',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.pegawai.destroy', $pegawai));

        $response->assertRedirect(route('admin.pegawai.index'));
        $this->assertDatabaseMissing('pegawai', ['id' => $pegawai->id]);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'status' => 'aktif',
        ]);
    }

    private function createLokasi(): LokasiPresensi
    {
        return LokasiPresensi::create([
            'nama_lokasi' => 'Kantor Utama',
            'latitude' => -6.200000,
            'longitude' => 106.816666,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);
    }
}
