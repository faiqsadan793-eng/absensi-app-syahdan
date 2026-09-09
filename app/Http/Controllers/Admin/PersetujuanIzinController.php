<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ketidakhadiran;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PersetujuanIzinController extends Controller
{
    public function index(Request $request)
    {
        $query = Ketidakhadiran::with('pegawai.jabatan')->latest('tanggal');
        $status = match ($request->string('status')->toString()) {
            'pending' => 'PENDING',
            'disetujui' => 'APPROVED',
            'ditolak' => 'REJECTED',
            default => '',
        };

        // Filter status pengajuan (Pending, Disetujui, Ditolak)
        if (in_array($status, ['PENDING', 'APPROVED', 'REJECTED'], true)) {
            $query->where('status_pengajuan', $status);
        }

        $pengajuan = $query->paginate(10)->withQueryString();
        $pengajuan->through(function (Ketidakhadiran $izin) {
            return [
                'id' => $izin->id,
                'pegawai' => $izin->pegawai,
                'kategori' => strtolower($izin->keterangan),
                'tanggal' => $izin->tanggal?->format('Y-m-d') ?? $izin->tanggal,
                'alasan' => $izin->deskripsi,
                'bukti_file' => $izin->file ? route('admin.izin.file', $izin->id) : null,
                'status' => match ($izin->status_pengajuan) {
                    'APPROVED' => 'disetujui',
                    'REJECTED' => 'ditolak',
                    default => 'pending',
                },
                'catatan_admin' => $izin->catatan_admin,
            ];
        });

        return Inertia::render('Admin/PersetujuanIzin', [
            'pengajuan' => $pengajuan,
            'filters' => ['status' => match ($status) {
                'APPROVED' => 'disetujui',
                'REJECTED' => 'ditolak',
                'PENDING' => 'pending',
                default => '',
            }],
        ]);
    }

    public function file(int $id)
    {
        $izin = Ketidakhadiran::findOrFail($id);

        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk('local');

        abort_if($izin->file === null || ! $storage->exists($izin->file), 404);

        return $storage->response($izin->file);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:disetujui,ditolak',
            'catatan_admin' => 'nullable|string|max:255',
        ]);

        $izin = Ketidakhadiran::findOrFail($id);
        $izin->update([
            'status_pengajuan' => $request->status === 'disetujui' ? 'APPROVED' : 'REJECTED',
            'catatan_admin' => $request->catatan_admin,
        ]);

        return redirect()->back()->with('success', "Pengajuan izin berhasil di-{$request->status}.");
    }
}
