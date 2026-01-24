<?php

namespace App\Services;

use App\Models\Zone;

class FeeAssessmentService
{
    /**
     * Calculate the zoning fee based on the application data.
     *
     * @param  array  $data
     * @return array
     */
    public function calculateZoningFee(array $data): array
    {
        $fee = 0;
        $breakdown = [];
        $classification = null;

        // Fetch zone classification derived from zone_id if available
        if (!empty($data['zone_id'])) {
            $zone = Zone::with('classification')->find($data['zone_id']);
            if ($zone && $zone->classification) {
                $classification = $zone->classification->code;
            }
        }

        // Subdivision Projects take precedence
        if (!empty($data['is_subdivision']) && $data['is_subdivision']) {
            $baseFee = 1000;
            $unitFee = 5;
            $units = (int) ($data['total_lots_planned'] ?? 0);
            
            $fee = $baseFee + ($unitFee * $units);
            
            $breakdown = [
                'type' => 'Subdivision Project',
                'base_fee' => $baseFee,
                'variable_fee' => $unitFee * $units,
                'variable_unit' => 'lots/units',
                'variable_rate' => $unitFee,
                'quantity' => $units,
                'total' => $fee,
            ];
            
            return [
                'amount' => $fee,
                'breakdown' => $breakdown,
                'currency' => 'PHP',
            ];
        }

        // Industrial (I1-I2)
        if ($this->isIndustrial($classification)) {
            $baseFee = 1500;
            $areaFee = 15;
            $area = (float) ($data['floor_area_sqm'] ?? 0);

            $fee = $baseFee + ($areaFee * $area);

            $breakdown = [
                'type' => 'Industrial Project',
                'classification' => $classification,
                'base_fee' => $baseFee,
                'variable_fee' => $areaFee * $area,
                'variable_unit' => 'sqm (floor area)',
                'variable_rate' => $areaFee,
                'quantity' => $area,
                'total' => $fee,
            ];
        }
        // Commercial (C1-C3)
        elseif ($this->isCommercial($classification)) {
            $baseFee = 1000;
            $areaFee = 10;
            $area = (float) ($data['floor_area_sqm'] ?? 0);

            $fee = $baseFee + ($areaFee * $area);

            $breakdown = [
                'type' => 'Commercial Project',
                'classification' => $classification,
                'base_fee' => $baseFee,
                'variable_fee' => $areaFee * $area,
                'variable_unit' => 'sqm (floor area)',
                'variable_rate' => $areaFee,
                'quantity' => $area,
                'total' => $fee,
            ];
        }
        // Residential Apartment (R3-R4) - OR if explicit apartment project type
        elseif ($this->isResidentialApartment($classification, $data)) {
            $baseFee = 500;
            $areaFee = 5;
            $area = (float) ($data['floor_area_sqm'] ?? 0);

            $fee = $baseFee + ($areaFee * $area);

            $breakdown = [
                'type' => 'Residential Apartment',
                'classification' => $classification,
                'base_fee' => $baseFee,
                'variable_fee' => $areaFee * $area,
                'variable_unit' => 'sqm (floor area)',
                'variable_rate' => $areaFee,
                'quantity' => $area,
                'total' => $fee,
            ];
        }
        // Residential House (R1-R2) - Default fallthrough for residential
        else {
            // Default to Residential House R1-R2 structure
            $fee = 500;
            
            $breakdown = [
                'type' => 'Residential House',
                'classification' => $classification ?? 'N/A',
                'base_fee' => 500,
                'variable_fee' => 0,
                'variable_unit' => 'N/A',
                'variable_rate' => 0,
                'quantity' => 0,
                'total' => $fee,
            ];
        }

        return [
            'amount' => $fee,
            'breakdown' => $breakdown,
            'currency' => 'PHP',
        ];
    }

    private function isIndustrial(?string $code): bool
    {
        if (!$code) return false;
        return in_array(strtoupper($code), ['I1', 'I2', 'I-1', 'I-2']);
    }

    private function isCommercial(?string $code): bool
    {
        if (!$code) return false;
        // Check for C1, C2, C3, and variants
        return preg_match('/^C-?[1-3]$/i', $code) === 1;
    }

    private function isResidentialApartment(?string $code, array $data): bool
    {
        // Explicit project type check
        if (($data['project_type'] ?? '') === 'apartment') {
            return true;
        }

        if (!$code) return false;
        
        // Check for R3, R4 and variants
        return preg_match('/^R-?[3-4]$/i', $code) === 1;
    }
}
