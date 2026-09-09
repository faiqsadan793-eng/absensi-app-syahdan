<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ketidakhadiran extends Model
{
    protected $table = 'ketidakhadiran';

    protected $fillable = [
        'id_pegawai', 'keterangan', 'tanggal',
        'deskripsi', 'file', 'status_pengajuan', 'catatan_admin',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'id_pegawai');
    }
}
