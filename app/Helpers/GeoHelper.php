<?php

namespace App\Helpers;

class GeoHelper
{
    /**
     * Hitung jarak dua titik GPS dalam satuan METER (Haversine Formula).
     */
    public static function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371000; // Jari-jari bumi dalam meter

        // Konversi derajat ke radian
        $latFrom = deg2rad((float) $lat1);
        $lonFrom = deg2rad((float) $lon1);
        $latTo = deg2rad((float) $lat2);
        $lonTo = deg2rad((float) $lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        // Rumus Haversine
        $haversine = pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2);
        $angle = 2 * asin(sqrt(min(1, max(0, $haversine))));

        return round($angle * $earthRadius, 2); // Return jarak dalam meter (presisi 2 desimal)
    }
}
