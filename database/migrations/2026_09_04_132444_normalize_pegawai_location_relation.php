<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->foreignId('lokasi_presensi_id')
                ->nullable()
                ->after('id_jabatan')
                ->constrained('lokasi_presensi')
                ->nullOnDelete();
        });

        $unmatchedPegawai = [];

        DB::table('pegawai')->select(['id', 'lokasi_presensi'])->orderBy('id')->each(function (object $pegawai) use (&$unmatchedPegawai): void {
            $lokasiId = DB::table('lokasi_presensi')
                ->where('nama_lokasi', $pegawai->lokasi_presensi)
                ->value('id');

            if ($lokasiId === null) {
                $unmatchedPegawai[] = $pegawai->id;

                return;
            }

            DB::table('pegawai')->where('id', $pegawai->id)->update([
                'lokasi_presensi_id' => $lokasiId,
            ]);
        });

        if ($unmatchedPegawai !== []) {
            throw new RuntimeException('Pegawai tidak memiliki lokasi presensi yang cocok: '.implode(', ', $unmatchedPegawai));
        }

        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn('lokasi_presensi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->string('lokasi_presensi', 50)->nullable()->after('lokasi_presensi_id');
        });

        DB::table('pegawai')->select(['id', 'lokasi_presensi_id'])->orderBy('id')->each(function (object $pegawai): void {
            $namaLokasi = DB::table('lokasi_presensi')
                ->where('id', $pegawai->lokasi_presensi_id)
                ->value('nama_lokasi');

            DB::table('pegawai')->where('id', $pegawai->id)->update([
                'lokasi_presensi' => $namaLokasi,
            ]);
        });

        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropForeign(['lokasi_presensi_id']);
            $table->dropColumn('lokasi_presensi_id');
        });
    }
};
