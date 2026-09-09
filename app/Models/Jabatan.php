<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    protected $table = 'jabatan';

    protected $fillable = ['jabatan'];

    public function pegawai()
    {
        return $this->hasMany(Pegawai::class, 'id_jabatan');
    }
}
