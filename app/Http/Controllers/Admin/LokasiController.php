<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\GeoHelper;
use App\Http\Controllers\Controller;
use App\Models\LokasiPresensi; // Sesuaikan dengan nama model milikmu
use Illuminate\Http\Request;
use Inertia\Inertia;

class LokasiController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Master-Data/DataLokasi', [
            'lokasi' => LokasiPresensi::withCount('pegawai')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'required|integer|min:5',
            'alamat_lokasi' => 'nullable|string|max:225',
            'tipe_lokasi' => 'nullable|string|max:50',
            'zona_waktu' => 'required|string|in:WIB,WITA,WIT',
            'jam_masuk' => 'required|date_format:H:i',
            'jam_pulang' => 'required|date_format:H:i',
        ]);

        LokasiPresensi::create([
            ...$validated,
            'tipe_lokasi' => $request->input('tipe_lokasi', 'Pusat') ?: 'Pusat',
        ]);

        return redirect()->back()->with('success', 'Lokasi presensi berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $lokasi = LokasiPresensi::findOrFail($id);

        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'required|integer|min:5',
            'alamat_lokasi' => 'nullable|string|max:225',
            'tipe_lokasi' => 'nullable|string|max:50',
            'zona_waktu' => 'required|string|in:WIB,WITA,WIT',
            'jam_masuk' => 'required|date_format:H:i',
            'jam_pulang' => 'required|date_format:H:i',
        ]);

        $lokasi->update([
            ...$validated,
            'tipe_lokasi' => $request->input('tipe_lokasi', 'Pusat') ?: 'Pusat',
        ]);

        return redirect()->back()->with('success', 'Data lokasi berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $lokasi = LokasiPresensi::findOrFail($id);

        if ($lokasi->pegawai()->exists()) {
            return redirect()->back()->with('error', 'Lokasi tidak dapat dihapus karena masih digunakan oleh pegawai.');
        }

        $lokasi->delete();

        return redirect()->back()->with('success', 'Lokasi presensi berhasil dihapus.');
    }

    /**
     * Contoh penggunaan Haversine saat Pegawai Absen Masuk
     */
    public function checkAbsen(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'lokasi_id' => 'required|integer|exists:lokasi_presensi,id',
        ]);

        $userLat = $request->latitude;
        $userLong = $request->longitude;
        $lokasiKantor = LokasiPresensi::findOrFail($request->lokasi_id);

        // Hitung Jarak menggunakan Haversine Helper
        $jarakMeter = GeoHelper::calculateDistance(
            $userLat, $userLong,
            $lokasiKantor->latitude, $lokasiKantor->longitude
        );

        // Cek apakah jarak pegawai <= radius yang diizinkan
        if ($jarakMeter > $lokasiKantor->radius) {
            return response()->json([
                'status' => 'error',
                'message' => "Anda di luar jangkauan! Jarak Anda {$jarakMeter}m dari kantor (Maksimal {$lokasiKantor->radius}m).",
                'jarak' => $jarakMeter,
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil disimulasikan! Posisi Anda sesuai.',
            'jarak' => $jarakMeter,
        ]);
    }
}
