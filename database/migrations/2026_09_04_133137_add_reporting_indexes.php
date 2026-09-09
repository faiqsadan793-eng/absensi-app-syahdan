<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->index(['tanggal_masuk', 'id_pegawai']);
        });

        Schema::table('ketidakhadiran', function (Blueprint $table) {
            $table->index(['status_pengajuan', 'tanggal', 'id_pegawai']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->dropIndex(['tanggal_masuk', 'id_pegawai']);
        });

        Schema::table('ketidakhadiran', function (Blueprint $table) {
            $table->dropIndex(['status_pengajuan', 'tanggal', 'id_pegawai']);
        });
    }
};
