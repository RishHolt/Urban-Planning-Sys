<?php

namespace App\Services;

use App\Models\Zone;
use Illuminate\Support\Collection;

class ZoneDetectionService
{
    /**
     * Detect which zone a point location falls within.
     *
     * @param  Collection<Zone>|null  $zones
     */
    public function detectZoneFromCoordinates(float $latitude, float $longitude, ?Collection $zones = null): ?Zone
    {
        if ($zones === null) {
            $zones = Zone::active()
                ->zoning()
                ->withGeometry()
                ->with('classification')
                ->get();
        }

        foreach ($zones as $zone) {
            if (! $zone->geometry) {
                continue;
            }

            if ($this->pointInGeometry($latitude, $longitude, $zone->geometry)) {
                return $zone;
            }
        }

        return null;
    }

    /**
     * Get nearby zones within a specified radius (in meters).
     *
     * @return Collection<Zone>
     */
    public function getNearbyZones(float $latitude, float $longitude, int $radiusMeters = 1000): Collection
    {
        // Simple bounding box approximation for initial filtering
        // 1 degree latitude ≈ 111km, so we calculate approximate bounds
        $latOffset = $radiusMeters / 111000;
        $lngOffset = $radiusMeters / (111000 * cos(deg2rad($latitude)));

        return Zone::active()
            ->zoning()
            ->withGeometry()
            ->with('classification')
            ->whereBetween('geometry', [
                [$latitude - $latOffset, $longitude - $lngOffset],
                [$latitude + $latOffset, $longitude + $lngOffset],
            ])
            ->get()
            ->filter(function ($zone) use ($latitude, $longitude) {
                // More precise distance calculation would go here
                // For now, we'll use the point-in-polygon check
                return $this->pointInGeometry($latitude, $longitude, $zone->geometry);
            });
    }

    /**
     * Check if a point is within a geometry (Polygon or MultiPolygon).
     */
    protected function pointInGeometry(float $latitude, float $longitude, array $geometry): bool
    {
        if (! isset($geometry['type']) || ! isset($geometry['coordinates'])) {
            return false;
        }

        $type = $geometry['type'];
        $coordinates = $geometry['coordinates'];

        if ($type === 'Polygon') {
            return $this->pointInPolygon($latitude, $longitude, $coordinates);
        }

        if ($type === 'MultiPolygon') {
            foreach ($coordinates as $polygon) {
                if ($this->pointInPolygon($latitude, $longitude, $polygon)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if a point is within a polygon using ray casting algorithm.
     */
    protected function pointInPolygon(float $latitude, float $longitude, array $polygonCoordinates): bool
    {
        if (empty($polygonCoordinates) || ! isset($polygonCoordinates[0])) {
            return false;
        }

        // Polygon coordinates are array of rings, first ring is exterior
        $exteriorRing = $polygonCoordinates[0];
        $inside = false;

        $j = count($exteriorRing) - 1;
        for ($i = 0; $i < count($exteriorRing); $i++) {
            $xi = $exteriorRing[$i][0] ?? 0; // longitude
            $yi = $exteriorRing[$i][1] ?? 0; // latitude
            $xj = $exteriorRing[$j][0] ?? 0;
            $yj = $exteriorRing[$j][1] ?? 0;

            if ((($yi > $latitude) !== ($yj > $latitude)) &&
                ($longitude < ($xj - $xi) * ($latitude - $yi) / ($yj - $yi) + $xi)) {
                $inside = ! $inside;
            }
            $j = $i;
        }

        // Check if point is in any interior holes (if present)
        if ($inside && count($polygonCoordinates) > 1) {
            for ($ringIndex = 1; $ringIndex < count($polygonCoordinates); $ringIndex++) {
                $hole = $polygonCoordinates[$ringIndex];
                if ($this->pointInPolygon($latitude, $longitude, [$hole])) {
                    return false; // Point is in a hole, so not in polygon
                }
            }
        }

        return $inside;
    }
}
