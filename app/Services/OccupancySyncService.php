<?php

namespace App\Services;

use App\Models\Allocation;
use App\Models\Building;
use App\Models\BuildingUnit;
use Illuminate\Support\Str;

class OccupancySyncService
{
    /**
     * Sync housing allocation to occupancy record.
     */
    public function syncFromHousingAllocation(Allocation $allocation): ?BuildingUnit
    {
        $housingUnit = $allocation->unit;
        if (! $housingUnit) {
            return null;
        }

        $housingProject = $housingUnit->project;
        if (! $housingProject) {
            return null;
        }

        // Find or create building
        $building = Building::where('housing_project_code', $housingProject->project_code)
            ->first();

        if (! $building) {
            // Create building from housing project
            $year = now()->year;
            $lastBuilding = Building::where('building_code', 'like', "BLD-{$year}-%")
                ->orderBy('building_code', 'desc')
                ->first();

            $sequence = 1;
            if ($lastBuilding) {
                $lastSequence = (int) Str::afterLast($lastBuilding->building_code, '-');
                $sequence = $lastSequence + 1;
            }

            $building = Building::create([
                'building_code' => sprintf('BLD-%d-%05d', $year, $sequence),
                'housing_project_code' => $housingProject->project_code,
                'building_name' => $housingProject->project_name,
                'address' => $housingProject->location ?? 'TBD',
                'building_type' => 'residential',
                'structure_source' => 'housing',
                'total_units' => $housingProject->total_units ?? 0,
                'occupancy_status' => 'partially_occupied',
                'is_active' => true,
                'registered_at' => now(),
            ]);
        }

        // Find or create unit
        $unit = BuildingUnit::where('building_id', $building->id)
            ->where('unit_no', $housingUnit->unit_no)
            ->first();

        if (! $unit) {
            $unit = BuildingUnit::create([
                'building_id' => $building->id,
                'unit_no' => $housingUnit->unit_no,
                'floor_number' => $housingUnit->floor_number ?? 1,
                'unit_type' => 'residential',
                'floor_area_sqm' => $housingUnit->floor_area_sqm,
                'max_occupants' => $this->calculateMaxOccupants($housingUnit->floor_area_sqm),
                'status' => 'vacant',
            ]);
        }

        return $unit;
    }

    /**
     * Calculate max occupants based on floor area (assuming 10 sqm per person minimum).
     */
    private function calculateMaxOccupants(?float $floorArea): ?int
    {
        if (! $floorArea || $floorArea <= 0) {
            return null;
        }

        return max(1, (int) floor($floorArea / 10));
    }

    /**
     * Update occupancy status when allocation is made.
     */
    public function updateOnAllocation(Allocation $allocation): void
    {
        $unit = $this->syncFromHousingAllocation($allocation);
        if ($unit) {
            $unit->update([
                'status' => 'reserved',
            ]);
        }
    }

    /**
     * Update occupancy status when beneficiary moves in.
     */
    public function updateOnMoveIn(Allocation $allocation): void
    {
        $unit = $this->syncFromHousingAllocation($allocation);
        if ($unit && $allocation->beneficiary) {
            $beneficiary = $allocation->beneficiary;
            $household = $beneficiary->household;

            $occupantCount = $household ? $household->members()->count() : 1;

            $unit->update([
                'status' => 'occupied',
                'current_occupant_count' => $occupantCount,
                'current_occupant_name' => $beneficiary->full_name,
                'occupancy_start_date' => $allocation->allocation_date ?? now(),
            ]);
        }
    }

    /**
     * Update occupancy status when unit becomes vacant.
     */
    public function updateOnVacancy(Allocation $allocation): void
    {
        $unit = $this->syncFromHousingAllocation($allocation);
        if ($unit) {
            $unit->update([
                'status' => 'vacant',
                'current_occupant_count' => 0,
                'current_occupant_name' => null,
                'occupancy_start_date' => null,
            ]);
        }
    }
}
