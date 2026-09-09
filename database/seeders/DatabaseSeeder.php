<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $jabatan = Jabatan::create(['jabatan' => 'IT Administrator']);
        $lokasi = LokasiPresensi::create([
            'nama_lokasi' => 'Pusat',
            'latitude' => -6.2000000,
            'longitude' => 106.8166667,
            'radius' => 100,
            'tipe_lokasi' => 'Pusat',
            'zona_waktu' => 'WIB',
            'jam_masuk' => '08:00:00',
            'jam_pulang' => '17:00:00',
        ]);

        $pegawaiAdmin = Pegawai::create([
            'nrg' => 'ADM-001',
            'nama' => 'Administrator System',
            'jenis_kelamin' => 'Laki-Laki',
            'alamat' => 'Kantor Pusat',
            'no_handphone' => '081234567890',
            'id_jabatan' => $jabatan->id,
            'lokasi_presensi_id' => $lokasi->id,
        ]);

        User::create([
            'pegawai_id' => $pegawaiAdmin->id,
            'username' => 'admin',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'aktif',
        ]);
    }
}
