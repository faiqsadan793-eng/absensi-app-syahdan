<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    protected $table = 'presensi';

    protected $fillable = [
        'id_pegawai', 'tanggal_masuk', 'jam_masuk', 'foto_masuk',
        'latitude_masuk', 'longitude_masuk', 'jarak_masuk_meter',
        'tanggal_keluar', 'jam_keluar', 'foto_keluar',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
        'latitude_masuk' => 'decimal:7',
        'longitude_masuk' => 'decimal:7',
        'jarak_masuk_meter' => 'decimal:2',
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'id_pegawai');
    }
}
