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
            $table->decimal('latitude_masuk', 10, 7)->nullable()->after('foto_masuk');
            $table->decimal('longitude_masuk', 10, 7)->nullable()->after('latitude_masuk');
            $table->decimal('jarak_masuk_meter', 10, 2)->nullable()->after('longitude_masuk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->dropColumn(['latitude_masuk', 'longitude_masuk', 'jarak_masuk_meter']);
        });
    }
};
