<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pegawai extends Model
{
    protected $table = 'pegawai';

    protected $fillable = [
        'nrg', 'nama', 'jenis_kelamin', 'alamat',
        'no_handphone', 'id_jabatan', 'lokasi_presensi_id', 'foto',
    ];

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'id_jabatan');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'pegawai_id');
    }

    public function presensi(): HasMany
    {
        return $this->hasMany(Presensi::class, 'id_pegawai');
    }

    public function ketidakhadiran(): HasMany
    {
        return $this->hasMany(Ketidakhadiran::class, 'id_pegawai');
    }

    public function lokasiPresensi(): BelongsTo
    {
        return $this->belongsTo(LokasiPresensi::class, 'lokasi_presensi_id');
    }
}
