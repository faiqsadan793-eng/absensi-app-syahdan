<?php

namespace App\Http\Middleware;

use App\Models\Ketidakhadiran;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user && ! $user->relationLoaded('pegawai')) {
            $user->load(['pegawai.jabatan', 'pegawai.lokasiPresensi']);
        }

        $pendingIzinCount = $user?->role === 'admin'
            ? Ketidakhadiran::where('status_pengajuan', 'PENDING')->count()
            : 0;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'pegawai' => $user?->pegawai,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'pendingIzinCount' => $pendingIzinCount,
        ];
    }
}
