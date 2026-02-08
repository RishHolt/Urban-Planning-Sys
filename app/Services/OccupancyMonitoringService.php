<?php

namespace App\Services;

use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyRecord;

class OccupancyMonitoringService
{
    /**
     * Get occupancy statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total_buildings' => Building::where('is_active', true)->count(),
            'total_units' => BuildingUnit::count(),
            'occupied_units' => BuildingUnit::where('status', 'occupied')->count(),
            'vacant_units' => BuildingUnit::where('status', 'vacant')->count(),
            'overcrowded_units' => BuildingUnit::whereRaw('current_occupant_count > max_occupants')
                ->whereNotNull('max_occupants')
                ->count(),
            'occupancy_rate' => $this->calculateOccupancyRate(),
            'average_occupants_per_unit' => $this->calculateAverageOccupants(),
        ];
    }

    /**
     * Calculate overall occupancy rate.
     */
    private function calculateOccupancyRate(): float
    {
        $total = BuildingUnit::count();
        if ($total === 0) {
            return 0;
        }

        $occupied = BuildingUnit::where('status', 'occupied')->count();

        return round(($occupied / $total) * 100, 2);
    }

    /**
     * Calculate average occupants per unit.
     */
    private function calculateAverageOccupants(): float
    {
        $occupiedUnits = BuildingUnit::where('status', 'occupied')
            ->where('current_occupant_count', '>', 0)
            ->get();

        if ($occupiedUnits->isEmpty()) {
            return 0;
        }

        $totalOccupants = $occupiedUnits->sum('current_occupant_count');

        return round($totalOccupants / $occupiedUnits->count(), 2);
    }

    /**
     * Get occupancy trends over time.
     */
    public function getOccupancyTrends(int $months = 12): array
    {
        $trends = [];
        $startDate = now()->subMonths($months);

        for ($i = 0; $i < $months; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $records = OccupancyRecord::whereBetween('start_date', [$monthStart, $monthEnd])
                ->get();

            $trends[] = [
                'month' => $date->format('Y-m'),
                'move_ins' => $records->where('record_type', 'move_in')->count(),
                'move_outs' => $records->where('record_type', 'move_out')->count(),
            ];
        }

        return $trends;
    }

    /**
     * Get buildings with low occupancy.
     */
    public function getLowOccupancyBuildings(float $threshold = 50.0): array
    {
        $buildings = Building::where('is_active', true)
            ->withCount(['units'])
            ->get();

        $lowOccupancy = [];

        /** @var Building $building */
        foreach ($buildings as $building) {
            $occupiedCount = $building->units()->where('status', 'occupied')->count();
            $totalUnits = $building->units_count ?? $building->units()->count();

            if ($totalUnits > 0) {
                $occupancyRate = ($occupiedCount / $totalUnits) * 100;

                if ($occupancyRate < $threshold) {
                    $lowOccupancy[] = [
                        'building' => $building,
                        'occupancy_rate' => round($occupancyRate, 2),
                        'occupied' => $occupiedCount,
                        'total' => $totalUnits,
                    ];
                }
            }
        }

        return $lowOccupancy;
    }
}
