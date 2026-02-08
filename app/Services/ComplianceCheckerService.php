<?php

namespace App\Services;

use App\Models\Zone;

class ComplianceCheckerService
{
    /**
     * Check compliance of application data against zoning rules.
     *
     * @return array{violations: array, warnings: array, compliant: bool, score: float}
     */
    public function checkCompliance(array $applicationData, ?Zone $zone = null): array
    {
        $violations = [];
        $warnings = [];

        if ($zone === null && ! empty($applicationData['zone_id'])) {
            $zone = Zone::with('classification')->find($applicationData['zone_id']);
        }

        if (! $zone || ! $zone->classification) {
            return [
                'violations' => ['Zone classification not found'],
                'warnings' => [],
                'compliant' => false,
                'score' => 0.0,
            ];
        }

        $classificationCode = $zone->classification->code;
        $rules = $this->getRulesForClassification($classificationCode);

        // Check setbacks
        $setbackViolations = $this->checkSetbacks($applicationData, $rules);
        $violations = array_merge($violations, $setbackViolations['violations']);
        $warnings = array_merge($warnings, $setbackViolations['warnings']);

        // Check floor area ratio
        $farViolations = $this->checkFloorAreaRatio($applicationData, $rules);
        $violations = array_merge($violations, $farViolations['violations']);
        $warnings = array_merge($warnings, $farViolations['warnings']);

        // Check building height
        $heightViolations = $this->checkBuildingHeight($applicationData, $rules);
        $violations = array_merge($violations, $heightViolations['violations']);
        $warnings = array_merge($warnings, $heightViolations['warnings']);

        // Check open space requirement
        $openSpaceViolations = $this->checkOpenSpace($applicationData, $rules);
        $violations = array_merge($violations, $openSpaceViolations['violations']);
        $warnings = array_merge($warnings, $openSpaceViolations['warnings']);

        // Check minimum lot area
        $lotAreaViolations = $this->checkMinimumLotArea($applicationData, $rules);
        $violations = array_merge($violations, $lotAreaViolations['violations']);
        $warnings = array_merge($warnings, $lotAreaViolations['warnings']);

        // Check land use compatibility
        $landUseViolations = $this->checkLandUseCompatibility($applicationData, $rules);
        $violations = array_merge($violations, $landUseViolations['violations']);

        // Calculate compliance score (0-100)
        $totalChecks = 6;
        $failedChecks = count($violations);
        $score = max(0, (($totalChecks - $failedChecks) / $totalChecks) * 100);

        return [
            'violations' => $violations,
            'warnings' => $warnings,
            'compliant' => empty($violations),
            'score' => round($score, 2),
            'classification' => $classificationCode,
            'zone_name' => $zone->classification->name,
        ];
    }

    /**
     * Get rules for a specific classification code.
     */
    protected function getRulesForClassification(string $classificationCode): array
    {
        $rules = config('zoning-compliance.rules', []);
        $default = config('zoning-compliance.default', [
            'setbacks' => [
                'front' => 3.0,
                'rear' => 2.0,
                'side' => 1.5,
            ],
            'floor_area_ratio' => 0.6,
            'max_height' => 15.0,
            'max_storeys' => 5,
            'open_space_requirement' => 0.2,
            'min_lot_area' => 100.0,
        ]);

        $classificationCode = strtoupper(trim($classificationCode));
        
        // Try exact match first
        if (isset($rules[$classificationCode])) {
            return $rules[$classificationCode];
        }

        // Try with different formats (e.g., "I-1" vs "I1")
        $normalizedCode = str_replace('-', '', $classificationCode);
        if (isset($rules[$normalizedCode])) {
            return $rules[$normalizedCode];
        }

        // Return default with required fields
        return array_merge($default, [
            'name' => 'Unknown Zone',
            'allowed_uses' => [],
        ]);
    }

    /**
     * Check setback requirements.
     *
     * @return array{violations: array, warnings: array}
     */
    protected function checkSetbacks(array $data, array $rules): array
    {
        $violations = [];
        $warnings = [];

        if (! isset($rules['setbacks'])) {
            return ['violations' => [], 'warnings' => []];
        }

        $requiredSetbacks = $rules['setbacks'];

        // Check front setback
        if (isset($data['front_setback_m'])) {
            if ($data['front_setback_m'] < $requiredSetbacks['front']) {
                $violations[] = "Front setback ({$data['front_setback_m']}m) is less than required ({$requiredSetbacks['front']}m)";
            } elseif ($data['front_setback_m'] < $requiredSetbacks['front'] * 1.1) {
                $warnings[] = "Front setback is close to minimum requirement. Consider increasing to {$requiredSetbacks['front']}m";
            }
        }

        // Check rear setback
        if (isset($data['rear_setback_m'])) {
            if ($data['rear_setback_m'] < $requiredSetbacks['rear']) {
                $violations[] = "Rear setback ({$data['rear_setback_m']}m) is less than required ({$requiredSetbacks['rear']}m)";
            }
        }

        // Check side setback
        if (isset($data['side_setback_m'])) {
            if ($data['side_setback_m'] < $requiredSetbacks['side']) {
                $violations[] = "Side setback ({$data['side_setback_m']}m) is less than required ({$requiredSetbacks['side']}m)";
            }
        }

        return ['violations' => $violations, 'warnings' => $warnings];
    }

    /**
     * Check floor area ratio (FAR).
     *
     * @return array{violations: array, warnings: array}
     */
    protected function checkFloorAreaRatio(array $data, array $rules): array
    {
        $violations = [];
        $warnings = [];

        if (! isset($rules['floor_area_ratio']) || empty($data['lot_area_total']) || empty($data['floor_area_sqm'])) {
            return ['violations' => [], 'warnings' => []];
        }

        $maxFAR = $rules['floor_area_ratio'];
        $actualFAR = $data['lot_area_total'] > 0 ? ($data['floor_area_sqm'] / $data['lot_area_total']) : 0;

        if ($actualFAR > $maxFAR) {
            $violations[] = "Floor Area Ratio ({$actualFAR}) exceeds maximum allowed ({$maxFAR})";
        } elseif ($actualFAR > $maxFAR * 0.95) {
            $warnings[] = 'Floor Area Ratio is close to maximum. Consider reducing floor area or increasing lot size';
        }

        return ['violations' => $violations, 'warnings' => $warnings];
    }

    /**
     * Check building height restrictions.
     *
     * @return array{violations: array, warnings: array}
     */
    protected function checkBuildingHeight(array $data, array $rules): array
    {
        $violations = [];
        $warnings = [];

        // Check storeys
        if (isset($rules['max_storeys']) && isset($data['number_of_storeys'])) {
            if ($data['number_of_storeys'] > $rules['max_storeys']) {
                $violations[] = "Number of storeys ({$data['number_of_storeys']}) exceeds maximum allowed ({$rules['max_storeys']})";
            } elseif ($data['number_of_storeys'] >= $rules['max_storeys'] - 1) {
                $warnings[] = 'Number of storeys is close to maximum. Verify height compliance';
            }
        }

        // Check height in meters (if provided)
        if (isset($rules['max_height']) && isset($data['building_height_m'])) {
            if ($data['building_height_m'] > $rules['max_height']) {
                $violations[] = "Building height ({$data['building_height_m']}m) exceeds maximum allowed ({$rules['max_height']}m)";
            }
        }

        return ['violations' => $violations, 'warnings' => $warnings];
    }

    /**
     * Check open space requirements.
     *
     * @return array{violations: array, warnings: array}
     */
    protected function checkOpenSpace(array $data, array $rules): array
    {
        $violations = [];
        $warnings = [];

        if (! isset($rules['open_space_requirement']) || empty($data['lot_area_total'])) {
            return ['violations' => [], 'warnings' => []];
        }

        $requiredOpenSpace = $rules['open_space_requirement'];
        $requiredArea = $data['lot_area_total'] * $requiredOpenSpace;

        // Calculate open space (lot area - building footprint)
        $buildingFootprint = $data['building_footprint_sqm'] ?? ($data['floor_area_sqm'] ?? 0);
        $openSpace = max(0, $data['lot_area_total'] - $buildingFootprint);
        $openSpacePercentage = $data['lot_area_total'] > 0 ? ($openSpace / $data['lot_area_total']) : 0;

        if ($openSpacePercentage < $requiredOpenSpace) {
            $violations[] = "Open space ({$openSpacePercentage}) is less than required ({$requiredOpenSpace}). Required: {$requiredArea} sqm";
        } elseif ($openSpacePercentage < $requiredOpenSpace * 1.1) {
            $warnings[] = 'Open space is close to minimum requirement. Consider reducing building footprint';
        }

        return ['violations' => $violations, 'warnings' => $warnings];
    }

    /**
     * Check minimum lot area requirement.
     *
     * @return array{violations: array, warnings: array}
     */
    protected function checkMinimumLotArea(array $data, array $rules): array
    {
        $violations = [];
        $warnings = [];

        if (! isset($rules['min_lot_area']) || empty($data['lot_area_total'])) {
            return ['violations' => [], 'warnings' => []];
        }

        if ($data['lot_area_total'] < $rules['min_lot_area']) {
            $violations[] = "Lot area ({$data['lot_area_total']} sqm) is less than minimum required ({$rules['min_lot_area']} sqm)";
        }

        return ['violations' => $violations, 'warnings' => $warnings];
    }

    /**
     * Check land use compatibility.
     *
     * @return array{violations: array, warnings: array}
     */
    protected function checkLandUseCompatibility(array $data, array $rules): array
    {
        $violations = [];

        if (! isset($data['land_use_type']) || empty($rules['allowed_uses'])) {
            return ['violations' => [], 'warnings' => []];
        }

        if (! in_array($data['land_use_type'], $rules['allowed_uses'])) {
            $violations[] = "Land use type '{$data['land_use_type']}' is not allowed in this zone. Allowed uses: ".implode(', ', $rules['allowed_uses']);
        }

        return ['violations' => $violations, 'warnings' => []];
    }

    /**
     * Generate compliance report with recommendations.
     */
    public function generateComplianceReport(array $complianceResult): array
    {
        $recommendations = [];

        foreach ($complianceResult['violations'] as $violation) {
            // Generate recommendations based on violation type
            if (str_contains($violation, 'setback')) {
                $recommendations[] = 'Adjust building position to meet setback requirements';
            } elseif (str_contains($violation, 'Floor Area Ratio')) {
                $recommendations[] = 'Reduce floor area or increase lot size to meet FAR requirements';
            } elseif (str_contains($violation, 'storeys') || str_contains($violation, 'height')) {
                $recommendations[] = 'Reduce number of storeys or building height to comply with zone restrictions';
            } elseif (str_contains($violation, 'Open space')) {
                $recommendations[] = 'Reduce building footprint to meet open space requirements';
            } elseif (str_contains($violation, 'Lot area')) {
                $recommendations[] = 'Verify lot area meets minimum requirements for this zone';
            } elseif (str_contains($violation, 'Land use')) {
                $recommendations[] = 'Consider changing land use type or applying for zone reclassification';
            }
        }

        return array_merge($complianceResult, [
            'recommendations' => array_unique($recommendations),
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
