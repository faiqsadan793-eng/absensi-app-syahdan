<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JabatanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Master-Data/DataJabatan', [
            'jabatan' => Jabatan::withCount('pegawai')->orderBy('jabatan')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jabatan' => 'required|string|max:50|unique:jabatan,jabatan',
        ]);

        Jabatan::create([
            'jabatan' => $request->jabatan,
        ]);

        return redirect()->route('admin.jabatan.index')->with('success', 'Data jabatan berhasil ditambahkan.');
    }

    public function update(Request $request, Jabatan $jabatan)
    {
        $request->validate([
            'jabatan' => 'required|string|max:50|unique:jabatan,jabatan,'.$jabatan->id,
        ]);

        $jabatan->update([
            'jabatan' => $request->jabatan,
        ]);

        return redirect()->route('admin.jabatan.index')->with('success', 'Data jabatan berhasil diperbarui.');
    }

    public function destroy(Jabatan $jabatan)
    {
        if ($jabatan->pegawai()->exists()) {
            return redirect()->route('admin.jabatan.index')->with('error', 'Jabatan tidak bisa dihapus karena masih digunakan pegawai.');
        }

        $jabatan->delete();

        return redirect()->route('admin.jabatan.index')->with('success', 'Data jabatan berhasil dihapus.');
    }
}
