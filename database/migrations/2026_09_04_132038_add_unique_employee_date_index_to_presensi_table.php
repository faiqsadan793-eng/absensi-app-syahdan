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
            $table->unique(['id_pegawai', 'tanggal_masuk']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->dropUnique(['id_pegawai', 'tanggal_masuk']);
        });
    }
};
