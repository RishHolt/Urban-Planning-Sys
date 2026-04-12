<?php

namespace App\Services;

use App\Models\ComplianceRule;
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

        // Weighted compliance scoring
        // Each check category has a weight reflecting its real-world importance
        $weights = [
            'land_use' => 25, // Wrong land use = fundamentally non-compliant
            'storeys' => 15, // Structural safety concern
            'height' => 10, // Related to storeys but separate metric
            'setbacks' => 20, // Fire safety, access, neighbor rights
            'far' => 15, // Density control
            'open_space' => 10, // Environmental / livability
            'lot_area' => 5, // Usually a prerequisite
        ];

        $deductions = 0;

        // Deduct for land use violations
        if (! empty($landUseViolations['violations'])) {
            $deductions += $weights['land_use'];
        }

        // Deduct for storey/height violations with severity scaling
        if (! empty($heightViolations['violations'])) {
            foreach ($heightViolations['violations'] as $v) {
                if (str_contains($v, 'CRITICAL')) {
                    // Extreme excess — full weight for storeys + height
                    $deductions += $weights['storeys'] + $weights['height'];
                    break;
                } elseif (str_contains($v, 'storeys')) {
                    $deductions += $weights['storeys'];
                } elseif (str_contains($v, 'height')) {
                    $deductions += $weights['height'];
                }
            }
        }

        // Deduct for setback violations — scale by how many axes fail
        if (! empty($setbackViolations['violations'])) {
            $setbackCount = count($setbackViolations['violations']);
            $perAxis = $weights['setbacks'] / 3; // front, rear, side
            $deductions += min($weights['setbacks'], $setbackCount * $perAxis);
        }

        // Deduct for FAR violation
        if (! empty($farViolations['violations'])) {
            $deductions += $weights['far'];
        }

        // Deduct for open space violation
        if (! empty($openSpaceViolations['violations'])) {
            $deductions += $weights['open_space'];
        }

        // Deduct for lot area violation
        if (! empty($lotAreaViolations['violations'])) {
            $deductions += $weights['lot_area'];
        }

        // Partial deductions for warnings (half weight)
        $warningDeduction = count($warnings) * 1.5;
        $deductions += min(10, $warningDeduction); // Cap warning penalty at 10

        $score = max(0, 100 - $deductions);

        // Determine status: 85+ compliant, 60-84 needs review, <60 non-compliant
        $status = 'non_compliant';
        if ($score >= 85 && empty($violations)) {
            $status = 'compliant';
        } elseif ($score >= 60) {
            $status = 'needs_review';
        }

        return [
            'violations' => $violations,
            'warnings' => $warnings,
            'compliant' => $status === 'compliant',
            'status' => $status,
            'score' => round($score, 2),
            'classification' => $classificationCode,
            'zone_name' => $zone->classification->name,
        ];
    }

    /**
     * Get rules for a specific classification code.
     * Checks the database first, then falls back to config file.
     */
    protected function getRulesForClassification(string $classificationCode): array
    {
        $classificationCode = strtoupper(trim($classificationCode));
        $normalizedCode = str_replace('-', '', $classificationCode);

        // Try database first (exact match, then normalized)
        $dbRule = ComplianceRule::where('is_active', true)
            ->where(function ($q) use ($classificationCode, $normalizedCode) {
                $q->where('classification_code', $classificationCode)
                    ->orWhere('classification_code', $normalizedCode);
            })
            ->first();

        if ($dbRule) {
            return $dbRule->toRulesArray();
        }

        // Fall back to config file
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

        if (isset($rules[$classificationCode])) {
            return $rules[$classificationCode];
        }

        if (isset($rules[$normalizedCode])) {
            return $rules[$normalizedCode];
        }

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
            } elseif ($data['front_setback_m'] <= $requiredSetbacks['front'] * 1.05) {
                $warnings[] = "Front setback ({$data['front_setback_m']}m) meets the minimum but consider adding a buffer beyond {$requiredSetbacks['front']}m";
            }
        }

        // Check rear setback
        if (isset($data['rear_setback_m'])) {
            if ($data['rear_setback_m'] < $requiredSetbacks['rear']) {
                $violations[] = "Rear setback ({$data['rear_setback_m']}m) is less than required ({$requiredSetbacks['rear']}m)";
            }
        }

        // Check side setbacks (supports left/right split or a single side_setback_m value)
        $sideLeft = $data['side_setback_left_m'] ?? $data['side_setback_m'] ?? null;
        $sideRight = $data['side_setback_right_m'] ?? null;

        if (isset($sideLeft)) {
            if ($sideLeft < $requiredSetbacks['side']) {
                $violations[] = "Left side setback ({$sideLeft}m) is less than required ({$requiredSetbacks['side']}m)";
            }
        }

        if (isset($sideRight)) {
            if ($sideRight < $requiredSetbacks['side']) {
                $violations[] = "Right side setback ({$sideRight}m) is less than required ({$requiredSetbacks['side']}m)";
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
            $storeys = (int) $data['number_of_storeys'];
            $maxStoreys = (int) $rules['max_storeys'];

            if ($storeys > $maxStoreys) {
                $ratio = $maxStoreys > 0 ? $storeys / $maxStoreys : $storeys;

                if ($ratio >= 3) {
                    $violations[] = "CRITICAL: Number of storeys ({$storeys}) drastically exceeds maximum allowed ({$maxStoreys}) — exceeds limit by ".round(($ratio - 1) * 100).'%';
                } else {
                    $violations[] = "Number of storeys ({$storeys}) exceeds maximum allowed ({$maxStoreys})";
                }
            } elseif ($storeys >= $maxStoreys - 1) {
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
        $requiredArea = round($data['lot_area_total'] * $requiredOpenSpace, 2);

        // Calculate open space (lot area - building footprint)
        $buildingFootprint = $data['building_footprint_sqm'] ?? ($data['floor_area_sqm'] ?? 0);
        $openSpace = max(0, $data['lot_area_total'] - $buildingFootprint);
        $openSpacePercentage = $data['lot_area_total'] > 0 ? ($openSpace / $data['lot_area_total']) : 0;

        $actualPct = round($openSpacePercentage * 100, 1);
        $requiredPct = round($requiredOpenSpace * 100, 1);

        if ($openSpacePercentage < $requiredOpenSpace) {
            $violations[] = "Open space ({$actualPct}%) is less than required ({$requiredPct}%). You need at least {$requiredArea} sqm of open space — reduce the building footprint.";
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
    /**
     * Maps a specific zoning classification code to its generic base use.
     */
    protected function getGenericUseFromClassification(string $classificationCode): string
    {
        $code = strtoupper(trim($classificationCode));
        if (str_starts_with($code, 'R')) {
            return 'residential';
        }
        if (str_starts_with($code, 'C')) {
            return 'commercial';
        }
        if (str_starts_with($code, 'I')) {
            return 'industrial';
        }
        if (str_starts_with($code, 'A')) {
            return 'agricultural';
        }
        if (str_starts_with($code, 'INS')) {
            return 'institutional';
        }
        if ($code === 'MU') {
            return 'mixed_use';
        }

        return $code; // fallback precisely if generic is sent
    }

    protected function checkLandUseCompatibility(array $data, array $rules): array
    {
        $violations = [];

        if (! isset($data['land_use_type']) || empty($rules['allowed_uses'])) {
            return ['violations' => [], 'warnings' => []];
        }

        $proposedClassification = $data['land_use_type'];
        $genericUse = $this->getGenericUseFromClassification($proposedClassification);

        // Check if either the generic use OR the exact classification code is allowed
        if (! in_array($genericUse, $rules['allowed_uses']) && ! in_array($proposedClassification, $rules['allowed_uses'])) {
            $violations[] = "Land use type '{$proposedClassification}' is not allowed in this zone. Allowed uses: ".implode(', ', $rules['allowed_uses']);
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
