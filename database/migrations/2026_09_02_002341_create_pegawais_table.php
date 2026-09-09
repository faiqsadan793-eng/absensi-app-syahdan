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
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('nrg', 50);
            $table->string('nama', 50);
            $table->string('jenis_kelamin', 10);
            $table->string('alamat', 225);
            $table->string('no_handphone', 20);
            $table->foreignId('id_jabatan')->nullable()->constrained('jabatan')->onDelete('set null');
            $table->string('lokasi_presensi', 50);
            $table->string('foto', 225)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
