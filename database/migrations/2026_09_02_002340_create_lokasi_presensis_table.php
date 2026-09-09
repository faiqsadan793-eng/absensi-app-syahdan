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
        Schema::create('lokasi_presensi', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lokasi', 50);
            $table->string('alamat_lokasi', 225)->nullable();
            $table->string('tipe_lokasi', 50)->default('Pusat');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('radius'); // dalam meter
            $table->string('zona_waktu', 4)->default('WIB'); // WIB, WITA, WIT
            $table->time('jam_masuk')->default('08:00:00');
            $table->time('jam_pulang')->default('17:00:00');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lokasi_presensi');
    }
};
