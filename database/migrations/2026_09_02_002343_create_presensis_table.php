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
        Schema::create('presensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pegawai')->constrained('pegawai')->onDelete('cascade');
            $table->date('tanggal_masuk');
            $table->time('jam_masuk');
            $table->string('foto_masuk', 225);
            $table->date('tanggal_keluar')->nullable();
            $table->time('jam_keluar')->nullable();
            $table->string('foto_keluar', 225)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presensi');
    }
};
