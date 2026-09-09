<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ketidakhadiran', function (Blueprint $table) {
            $table->string('catatan_admin', 255)->nullable()->after('status_pengajuan');
        });
    }

    public function down(): void
    {
        Schema::table('ketidakhadiran', function (Blueprint $table) {
            $table->dropColumn('catatan_admin');
        });
    }
};
