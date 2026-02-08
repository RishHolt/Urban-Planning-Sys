<?php

namespace App\Services;

use App\Models\BuildingUnit;
use App\Models\OccupancyRecord;
use App\Models\Violation;
use Illuminate\Support\Str;

class ViolationDetectionService
{
    /**
     * Detect and create overcrowding violation.
     */
    public function detectOvercrowding(BuildingUnit $unit, OccupancyRecord $record): ?Violation
    {
        if (! $unit->isOvercrowded()) {
            return null;
        }

        // Generate violation number
        $year = now()->year;
        $lastViolation = Violation::where('violation_no', 'like', "VIO-{$year}-%")
            ->orderBy('violation_no', 'desc')
            ->first();

        $sequence = 1;
        if ($lastViolation) {
            $lastSequence = (int) Str::afterLast($lastViolation->violation_no, '-');
            $sequence = $lastSequence + 1;
        }

        $violation = Violation::create([
            'violation_no' => sprintf('VIO-%d-%05d', $year, $sequence),
            'building_id' => $unit->building_id,
            'unit_id' => $unit->id,
            'violation_type' => 'overcrowding',
            'description' => sprintf(
                'Unit %s exceeds maximum occupancy limit. Current: %d, Maximum: %d',
                $unit->unit_no,
                $unit->current_occupant_count,
                $unit->max_occupants
            ),
            'severity' => $this->determineSeverity($unit),
            'status' => 'open',
            'violation_date' => now(),
            'compliance_deadline' => now()->addDays(30),
            'issued_by' => $record->recorded_by,
        ]);

        return $violation;
    }

    /**
     * Determine violation severity based on overcrowding percentage.
     */
    private function determineSeverity(BuildingUnit $unit): string
    {
        if ($unit->max_occupants === null || $unit->max_occupants === 0) {
            return 'minor';
        }

        $percentage = ($unit->current_occupant_count / $unit->max_occupants) * 100;

        if ($percentage >= 200) {
            return 'critical';
        } elseif ($percentage >= 150) {
            return 'major';
        }

        return 'minor';
    }
}
