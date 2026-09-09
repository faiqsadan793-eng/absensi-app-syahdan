<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use App\Models\LokasiPresensi;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PegawaiController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Master-Data/DataPegawai', [
            'pegawai' => Pegawai::with(['jabatan', 'user', 'lokasiPresensi'])
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'jabatan' => Jabatan::orderBy('jabatan')->get(),
            'lokasi' => LokasiPresensi::orderBy('nama_lokasi')->get(['id', 'nama_lokasi']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nrg' => 'required|string|max:50|unique:pegawai,nrg',
            'nama' => 'required|string|max:50',
            'jenis_kelamin' => 'required|string',
            'alamat' => 'required|string|max:225',
            'no_handphone' => 'required|string|max:20',
            'id_jabatan' => 'required|exists:jabatan,id',
            'lokasi_presensi_id' => 'required|integer|exists:lokasi_presensi,id',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:6',
            'status' => 'nullable|in:aktif,nonaktif',
        ]);

        DB::transaction(function () use ($request) {
            $pegawai = Pegawai::create($request->only([
                'nrg', 'nama', 'jenis_kelamin', 'alamat', 'no_handphone', 'id_jabatan', 'lokasi_presensi_id',
            ]));

            User::create([
                'pegawai_id' => $pegawai->id,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => 'pegawai',
                'status' => $request->input('status', 'aktif'),
            ]);
        });

        return redirect()->route('admin.pegawai.index')->with('success', 'Data pegawai berhasil ditambahkan.');
    }

    public function update(Request $request, Pegawai $pegawai)
    {
        $user = $pegawai->user;

        $request->validate([
            'nrg' => 'required|string|max:50|unique:pegawai,nrg,'.$pegawai->id,
            'nama' => 'required|string|max:50',
            'jenis_kelamin' => 'required|string',
            'alamat' => 'required|string|max:225',
            'no_handphone' => 'required|string|max:20',
            'id_jabatan' => 'required|exists:jabatan,id',
            'lokasi_presensi_id' => 'required|integer|exists:lokasi_presensi,id',
            'username' => 'required|string|unique:users,username,'.($user?->id ?? 'NULL'),
            'password' => 'nullable|string|min:6',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        DB::transaction(function () use ($request, $pegawai, $user) {
            $pegawai->update($request->only([
                'nrg', 'nama', 'jenis_kelamin', 'alamat', 'no_handphone', 'id_jabatan', 'lokasi_presensi_id',
            ]));

            if ($user) {
                $userData = [
                    'username' => $request->username,
                    'status' => $request->status,
                ];

                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }

                $user->update($userData);
            }
        });

        return redirect()->route('admin.pegawai.index')->with('success', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(Pegawai $pegawai)
    {
        if ($pegawai->presensi()->exists() || $pegawai->ketidakhadiran()->exists()) {
            return redirect()->route('admin.pegawai.index')->with(
                'error',
                'Pegawai memiliki riwayat presensi/pengajuan. Nonaktifkan status akun pegawai alih-alih menghapusnya untuk menjaga data riwayat.'
            );
        }

        $pegawai->user()?->delete();
        $pegawai->delete();

        return redirect()->route('admin.pegawai.index')->with('success', 'Data pegawai berhasil dihapus.');
    }
}
