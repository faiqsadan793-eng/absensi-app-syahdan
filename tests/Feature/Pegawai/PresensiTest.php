<?php

namespace Tests\Feature\Pegawai;

use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\Presensi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PresensiTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    public function test_guests_cannot_submit_attendance(): void
    {
        $response = $this->post(route('pegawai.presensi.masuk'), $this->validPayload());

        $response->assertRedirect(route('login'));
    }

    public function test_employee_dashboard_contains_only_their_attendance_summary(): void
    {
        $user = $this->employeeUser();
        Presensi::create([
            'id_pegawai' => $user->pegawai_id,
            'tanggal_masuk' => now()->toDateString(),
            'jam_masuk' => '08:00:00',
            'foto_masuk' => 'presensi/test.png',
        ]);

        $response = $this->actingAs($user)->get(route('pegawai.dashboard'));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pegawai/Presensi')
            ->where('pegawai.id', $user->pegawai_id)
            ->where('ringkasan.presensiBulanIni', 1)
            ->has('riwayatPresensi', 1)
            ->has('riwayatPengajuan', 0)
        );
    }

    public function test_admin_cannot_submit_employee_attendance(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->post(route('pegawai.presensi.masuk'), $this->validPayload());

        $response->assertForbidden();
    }

    public function test_employee_can_submit_attendance_inside_assigned_location(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        $response = $this->actingAs($user)
            ->post(route('pegawai.presensi.masuk'), $this->validPayload());

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Presensi masuk berhasil!');
        $this->assertTrue(
            Presensi::where('id_pegawai', $user->pegawai_id)
                ->whereDate('tanggal_masuk', now()->toDateString())
                ->exists(),
        );

        $presensi = $user->pegawai->presensi()->first();
        $this->assertSame('0.0000000', $presensi->latitude_masuk);
        $this->assertSame('0.0000000', $presensi->longitude_masuk);
        $this->assertSame('0.00', $presensi->jarak_masuk_meter);
        Storage::disk('local')->assertExists($presensi->foto_masuk);
        Storage::disk('public')->assertMissing($presensi->foto_masuk);
    }

    public function test_admin_can_read_employee_attendance_details_and_private_photo(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        $this->actingAs($user)->post(route('pegawai.presensi.masuk'), $this->validPayload());
        $presensi = $user->pegawai->presensi()->firstOrFail();
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.riwayat.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/RiwayatPresensi')
            ->where('riwayat.data.0.id', $presensi->id)
            ->where('riwayat.data.0.lokasi_masuk', [0, 0])
            ->where('riwayat.data.0.jarak_meter', 0)
        );

        $this->actingAs($admin)
            ->get(route('admin.riwayat.foto', [$presensi, 'masuk']))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    }

    public function test_employee_cannot_submit_attendance_outside_assigned_location(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        $response = $this->actingAs($user)->post(route('pegawai.presensi.masuk'), [
            ...$this->validPayload(),
            'latitude' => 0.01,
        ]);

        $response->assertSessionHasErrors('latitude');
        $this->assertDatabaseCount('presensi', 0);
        Storage::disk('local')->assertDirectoryEmpty('presensi');
    }

    public function test_employee_cannot_submit_invalid_photo(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();

        $response = $this->actingAs($user)->post(route('pegawai.presensi.masuk'), [
            ...$this->validPayload(),
            'foto' => 'data:image/png;base64,not-a-real-image',
        ]);

        $response->assertSessionHasErrors('foto');
        $this->assertDatabaseCount('presensi', 0);
        Storage::disk('local')->assertDirectoryEmpty('presensi');
    }

    public function test_employee_can_submit_attendance_only_once_per_day(): void
    {
        Storage::fake('local');
        $user = $this->employeeUser();
        $route = route('pegawai.presensi.masuk');

        $this->actingAs($user)->post($route, $this->validPayload())->assertRedirect();
        $response = $this->actingAs($user)->post($route, $this->validPayload());

        $response->assertSessionHasErrors('presensi');
        $this->assertDatabaseCount('presensi', 1);
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
        ]);
    }

    private function validPayload(): array
    {
        return [
            'latitude' => 0,
            'longitude' => 0,
            'foto' => self::PNG,
        ];
    }
}
