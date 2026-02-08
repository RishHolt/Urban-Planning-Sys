<?php

namespace App\Services;

use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyInspection;
use Carbon\Carbon;

class InspectionSchedulingService
{
    /**
     * Schedule next inspection based on building type and last inspection.
     */
    public function scheduleNextInspection(Building $building, ?Carbon $lastInspectionDate = null): ?Carbon
    {
        $lastDate = $lastInspectionDate ?? $building->last_inspection_date;

        if (! $lastDate) {
            return now()->addMonths(6); // Default 6 months for first inspection
        }

        // Schedule based on building type
        return match ($building->building_type) {
            'residential' => $lastDate->copy()->addYear(), // Annual
            'commercial' => $lastDate->copy()->addMonths(6), // Semi-annual
            'industrial' => $lastDate->copy()->addMonths(3), // Quarterly
            'institutional' => $lastDate->copy()->addMonths(6), // Semi-annual
            'mixed_use' => $lastDate->copy()->addMonths(6), // Semi-annual
            default => $lastDate->copy()->addYear(),
        };
    }

    /**
     * Schedule next inspection for unit.
     */
    public function scheduleNextUnitInspection(BuildingUnit $unit, ?Carbon $lastInspectionDate = null): ?Carbon
    {
        $lastDate = $lastInspectionDate ?? $unit->last_inspection_date;

        if (! $lastDate) {
            return now()->addMonths(6);
        }

        // Units get inspected more frequently if they have violations or complaints
        $hasOpenViolations = $unit->violations()
            ->whereIn('status', ['open', 'under_review'])
            ->exists();

        $hasRecentComplaints = $unit->complaints()
            ->where('submitted_at', '>=', now()->subMonths(3))
            ->exists();

        if ($hasOpenViolations || $hasRecentComplaints) {
            return $lastDate->copy()->addMonths(3); // Quarterly for problematic units
        }

        return $lastDate->copy()->addYear(); // Annual for normal units
    }

    /**
     * Auto-schedule inspections for buildings due for inspection.
     */
    public function scheduleDueInspections(): int
    {
        $count = 0;

        // Buildings due for inspection
        $buildings = Building::where('is_active', true)
            ->whereNotNull('next_inspection_date')
            ->where('next_inspection_date', '<=', now())
            ->get();

        foreach ($buildings as $building) {
            OccupancyInspection::create([
                'building_id' => $building->id,
                'inspection_type' => 'periodic',
                'inspector_id' => 1, // TODO: Assign to appropriate inspector
                'scheduled_date' => now()->addDays(7), // Schedule 7 days from now
            ]);

            $count++;
        }

        // Units due for inspection
        $units = BuildingUnit::whereNotNull('next_inspection_date')
            ->where('next_inspection_date', '<=', now())
            ->where('status', 'occupied')
            ->get();

        foreach ($units as $unit) {
            OccupancyInspection::create([
                'building_id' => $unit->building_id,
                'unit_id' => $unit->id,
                'inspection_type' => 'periodic',
                'inspector_id' => 1, // TODO: Assign to appropriate inspector
                'scheduled_date' => now()->addDays(7),
            ]);

            $count++;
        }

        return $count;
    }
}
