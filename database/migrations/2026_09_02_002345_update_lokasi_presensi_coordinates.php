<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lokasi_presensi', function (Blueprint $table) {
            $table->string('alamat_lokasi', 225)->nullable()->change();
            $table->decimal('latitude', 10, 7)->change();
            $table->decimal('longitude', 10, 7)->change();
        });
    }

    public function down(): void
    {
        Schema::table('lokasi_presensi', function (Blueprint $table) {
            $table->string('alamat_lokasi', 225)->nullable(false)->change();
            $table->string('latitude', 50)->change();
            $table->string('longitude', 50)->change();
        });
    }
};
