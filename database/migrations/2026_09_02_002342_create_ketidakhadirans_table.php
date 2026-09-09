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
        Schema::create('ketidakhadiran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pegawai')->constrained('pegawai')->onDelete('cascade');
            $table->string('keterangan', 50); // Sakit / Izin / Cuti
            $table->date('tanggal');
            $table->string('deskripsi', 225);
            $table->string('file', 225)->nullable();
            $table->enum('status_pengajuan', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ketidakhadiran');
    }
};
