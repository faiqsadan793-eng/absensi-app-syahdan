<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKetidakhadiranRequest;
use App\Http\Requests\UpdateKetidakhadiranRequest;
use App\Models\Ketidakhadiran;
use App\Models\Presensi;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class KetidakhadiranController extends Controller
{
    public function index(Request $request): Response
    {
        $pegawai = $this->pegawaiId($request);

        return Inertia::render('Pegawai/Ketidakhadiran/Index', [
            'ketidakhadiran' => Ketidakhadiran::where('id_pegawai', $pegawai)
                ->latest('tanggal')
                ->paginate(10),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->pegawaiId($request);

        return Inertia::render('Pegawai/Ketidakhadiran/Create');
    }

    public function store(StoreKetidakhadiranRequest $request): RedirectResponse
    {
        $pegawaiId = $this->pegawaiId($request);
        $data = $request->safe()->only(['keterangan', 'tanggal', 'deskripsi']);

        // Cek konflik pengajuan pada tanggal yang sama
        if (Ketidakhadiran::where('id_pegawai', $pegawaiId)
            ->whereDate('tanggal', $data['tanggal'])
            ->whereIn('status_pengajuan', ['PENDING', 'APPROVED'])
            ->exists()) {
            throw ValidationException::withMessages([
                'tanggal' => 'Pengajuan ketidakhadiran untuk tanggal ini sudah ada.',
            ]);
        }

        // Cek apakah sudah ada presensi pada tanggal tersebut
        if (Presensi::where('id_pegawai', $pegawaiId)
            ->whereDate('tanggal_masuk', $data['tanggal'])
            ->exists()) {
            throw ValidationException::withMessages([
                'tanggal' => 'Anda sudah memiliki catatan presensi masuk pada tanggal ini.',
            ]);
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('ketidakhadiran');
        }

        Ketidakhadiran::create([
            ...$data,
            'id_pegawai' => $pegawaiId,
            'status_pengajuan' => 'PENDING',
        ]);

        return redirect()->route('pegawai.ketidakhadiran.index')
            ->with('success', 'Pengajuan ketidakhadiran berhasil dikirim.');
    }

    public function show(Request $request, Ketidakhadiran $ketidakhadiran): Response
    {
        $this->assertOwner($request, $ketidakhadiran);

        return Inertia::render('Pegawai/Ketidakhadiran/Show', [
            'ketidakhadiran' => $ketidakhadiran,
        ]);
    }

    public function edit(Request $request, Ketidakhadiran $ketidakhadiran): Response
    {
        $this->assertOwner($request, $ketidakhadiran);

        abort_unless($ketidakhadiran->status_pengajuan === 'PENDING', 403);

        return Inertia::render('Pegawai/Ketidakhadiran/Edit', [
            'ketidakhadiran' => $ketidakhadiran,
        ]);
    }

    public function update(
        UpdateKetidakhadiranRequest $request,
        Ketidakhadiran $ketidakhadiran,
    ): RedirectResponse {
        $pegawaiId = $this->pegawaiId($request);
        $data = $request->safe()->only(['keterangan', 'tanggal', 'deskripsi']);

        // Cek konflik jika tanggal diubah
        if (Ketidakhadiran::where('id_pegawai', $pegawaiId)
            ->where('id', '!=', $ketidakhadiran->id)
            ->whereDate('tanggal', $data['tanggal'])
            ->whereIn('status_pengajuan', ['PENDING', 'APPROVED'])
            ->exists()) {
            throw ValidationException::withMessages([
                'tanggal' => 'Pengajuan ketidakhadiran untuk tanggal ini sudah ada.',
            ]);
        }

        if (Presensi::where('id_pegawai', $pegawaiId)
            ->whereDate('tanggal_masuk', $data['tanggal'])
            ->exists()) {
            throw ValidationException::withMessages([
                'tanggal' => 'Anda sudah memiliki catatan presensi masuk pada tanggal ini.',
            ]);
        }

        if ($request->hasFile('file')) {
            if ($ketidakhadiran->file !== null && Storage::disk('local')->exists($ketidakhadiran->file)) {
                Storage::disk('local')->delete($ketidakhadiran->file);
            }

            $data['file'] = $request->file('file')->store('ketidakhadiran');
        }

        $ketidakhadiran->update($data);

        return redirect()->route('pegawai.ketidakhadiran.index')
            ->with('success', 'Pengajuan ketidakhadiran berhasil diperbarui.');
    }

    public function destroy(Request $request, Ketidakhadiran $ketidakhadiran): RedirectResponse
    {
        $this->assertOwner($request, $ketidakhadiran);
        abort_unless($ketidakhadiran->status_pengajuan === 'PENDING', 403);

        if ($ketidakhadiran->file !== null && Storage::disk('local')->exists($ketidakhadiran->file)) {
            Storage::disk('local')->delete($ketidakhadiran->file);
        }

        $ketidakhadiran->delete();

        return redirect()->route('pegawai.ketidakhadiran.index')
            ->with('success', 'Pengajuan ketidakhadiran berhasil dihapus.');
    }

    public function file(Request $request, Ketidakhadiran $ketidakhadiran)
    {
        $this->assertOwner($request, $ketidakhadiran);

        /** @var FilesystemAdapter $storage */
        $storage = Storage::disk('local');

        abort_if($ketidakhadiran->file === null || ! $storage->exists($ketidakhadiran->file), 404);

        return $storage->response($ketidakhadiran->file);
    }

    private function pegawaiId(Request $request): int
    {
        $pegawaiId = $request->user()?->pegawai_id;

        abort_if($pegawaiId === null, 403, 'Akun belum terhubung ke data pegawai.');

        return $pegawaiId;
    }

    private function assertOwner(Request $request, Ketidakhadiran $ketidakhadiran): void
    {
        abort_unless($ketidakhadiran->id_pegawai === $this->pegawaiId($request), 404);
    }
}
