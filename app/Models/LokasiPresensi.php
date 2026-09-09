<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LokasiPresensi extends Model
{
    protected $table = 'lokasi_presensi';

    protected $fillable = [
        'nama_lokasi', 'alamat_lokasi', 'tipe_lokasi',
        'latitude', 'longitude', 'radius', 'zona_waktu',
        'jam_masuk', 'jam_pulang',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'radius' => 'integer',
    ];

    public function pegawai(): HasMany
    {
        return $this->hasMany(Pegawai::class, 'lokasi_presensi_id');
    }
}
