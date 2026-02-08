<?php

namespace App\Services;

use App\Models\Zone;

class ZoningValidationService
{
    public function __construct(
        protected ZoneDetectionService $zoneDetectionService
    ) {}

    /**
     * Validate that the zone_id matches the provided coordinates.
     *
     * @return array{valid: bool, message: string, detected_zone_id: int|null}
     */
    public function validateZoneLocation(?int $zoneId, ?float $latitude, ?float $longitude): array
    {
        if ($latitude === null || $longitude === null) {
            return [
                'valid' => false,
                'message' => 'Location coordinates are required.',
                'detected_zone_id' => null,
            ];
        }

        if ($zoneId === null) {
            return [
                'valid' => false,
                'message' => 'Zone selection is required.',
                'detected_zone_id' => null,
            ];
        }

        $detectedZone = $this->zoneDetectionService->detectZoneFromCoordinates($latitude, $longitude);

        if ($detectedZone === null) {
            return [
                'valid' => false,
                'message' => 'No zone detected for the specified location. Please select a valid location on the map.',
                'detected_zone_id' => null,
            ];
        }

        if ($detectedZone->id !== $zoneId) {
            $detectedCode = $detectedZone->classification->code ?? 'Unknown';

            return [
                'valid' => false,
                'message' => "The selected zone does not match the detected zone for this location. Detected zone: {$detectedCode}.",
                'detected_zone_id' => $detectedZone->id,
            ];
        }

        return [
            'valid' => true,
            'message' => 'Zone validation passed.',
            'detected_zone_id' => $detectedZone->id,
        ];
    }

    /**
     * Validate land use compatibility with zone classification.
     *
     * @return array{valid: bool, message: string}
     */
    public function validateLandUseCompatibility(int $zoneId, string $landUseType): array
    {
        $zone = Zone::with('classification')->find($zoneId);

        if (! $zone || ! $zone->classification) {
            return [
                'valid' => false,
                'message' => 'Zone classification not found.',
            ];
        }

        $allowedUses = $this->getAllowedUsesForClassification($zone->classification->code);

        if (! in_array($landUseType, $allowedUses)) {
            return [
                'valid' => false,
                'message' => "Land use type '{$landUseType}' is not compatible with zone classification '{$zone->classification->code}'. Allowed uses: ".implode(', ', $allowedUses),
            ];
        }

        return [
            'valid' => true,
            'message' => 'Land use is compatible with zone classification.',
        ];
    }

    /**
     * Get allowed uses for a zoning classification code.
     *
     * @return array<string>
     */
    protected function getAllowedUsesForClassification(string $classificationCode): array
    {
        // Define allowed uses by classification code
        $rules = [
            // Residential
            'R1' => ['residential'],
            'R2' => ['residential'],
            'R3' => ['residential', 'mixed_use'],
            'R4' => ['residential', 'mixed_use'],
            // Commercial
            'C1' => ['commercial', 'mixed_use'],
            'C2' => ['commercial', 'mixed_use'],
            'C3' => ['commercial', 'mixed_use'],
            // Industrial
            'I1' => ['industrial'],
            'I2' => ['industrial'],
            // Agricultural
            'A1' => ['agricultural'],
            'A2' => ['agricultural'],
            // Institutional
            'INS' => ['institutional'],
            // Mixed Use
            'MU' => ['mixed_use', 'residential', 'commercial'],
        ];

        // Default: allow all if not specified
        $defaultUses = ['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use'];

        return $rules[strtoupper($classificationCode)] ?? $defaultUses;
    }

    /**
     * Validate required fields based on project type.
     *
     * @return array{valid: bool, errors: array<string, string>}
     */
    public function validateProjectRequirements(array $data): array
    {
        $errors = [];

        // Subdivision projects require additional fields
        if (! empty($data['is_subdivision']) && $data['is_subdivision']) {
            if (empty($data['subdivision_name'])) {
                $errors['subdivision_name'] = 'Subdivision name is required for subdivision projects.';
            }

            if (empty($data['total_lots_planned']) || $data['total_lots_planned'] <= 0) {
                $errors['total_lots_planned'] = 'Total lots planned must be greater than 0 for subdivision projects.';
            }
        }

        // Building projects require floor area
        if (! empty($data['project_type']) && in_array($data['project_type'], ['new_construction', 'addition'])) {
            if (empty($data['floor_area_sqm']) || $data['floor_area_sqm'] <= 0) {
                $errors['floor_area_sqm'] = 'Floor area is required for building projects.';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }
}
