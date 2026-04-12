<?php

namespace App\Services;

use App\Models\Zone;

class FeeAssessmentService
{
    // Fixed fees applied to every application (Caloocan City Revenue Code)
    private const FILING_FEE = 250;

    private const INSPECTION_FEE = 200;

    // Zoning & Land Use Verification Fee
    private const VERIFICATION_FEE_STANDARD = 400;     // Residential / Commercial

    private const VERIFICATION_FEE_INSTITUTIONAL = 300; // Institutional

    // Processing Fee rates per sqm of total floor area
    private const PROCESSING_RATE_RESIDENTIAL = 5;

    private const PROCESSING_RATE_COMMERCIAL = 5;

    private const PROCESSING_RATE_INSTITUTIONAL = 3;

    private const PROCESSING_RATE_INDUSTRIAL = 5;   // Follows commercial rate (not in Caloocan schedule)

    private const PROCESSING_RATE_MIXED_USE = 5;    // Follows commercial rate

    private const PROCESSING_RATE_AGRICULTURAL = 0; // No processing fee for agricultural

    /**
     * Calculate the zoning fee based on the application data.
     * Fee structure based on Caloocan City Revenue Code:
     *   Filing Fee             : PHP 250.00 (all applications)
     *   Verification Fee       : PHP 400.00 (residential/commercial) | PHP 300.00 (institutional)
     *   Inspection Fee         : PHP 200.00 (all applications)
     *   Processing Fee         : PHP x.xx per sqm of total floor area
     */
    public function calculateZoningFee(array $data): array
    {
        $classification = null;

        if (! empty($data['zone_id'])) {
            try {
                $zone = Zone::with('classification')->find($data['zone_id']);
                if ($zone && $zone->classification) {
                    $classification = $zone->classification->code;
                }
            } catch (\Exception $e) {
                \Log::warning('Zone lookup failed in fee calculation', [
                    'zone_id' => $data['zone_id'] ?? null,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Subdivision projects — separate fee structure
        if (! empty($data['is_subdivision']) && $data['is_subdivision']) {
            return $this->calculateSubdivisionFee($data, $classification);
        }

        $floorArea = max(0, (float) ($data['floor_area_sqm'] ?? 0));

        if ($this->isInstitutional($classification)) {
            return $this->buildResult(
                'Institutional Project',
                $classification,
                self::VERIFICATION_FEE_INSTITUTIONAL,
                self::PROCESSING_RATE_INSTITUTIONAL,
                $floorArea
            );
        }

        if ($this->isIndustrial($classification)) {
            return $this->buildResult(
                'Industrial Project',
                $classification,
                self::VERIFICATION_FEE_STANDARD,
                self::PROCESSING_RATE_INDUSTRIAL,
                $floorArea
            );
        }

        if ($this->isCommercial($classification)) {
            return $this->buildResult(
                'Commercial Project',
                $classification,
                self::VERIFICATION_FEE_STANDARD,
                self::PROCESSING_RATE_COMMERCIAL,
                $floorArea
            );
        }

        if ($this->isMixedUse($classification)) {
            return $this->buildResult(
                'Mixed Use Project',
                $classification,
                self::VERIFICATION_FEE_STANDARD,
                self::PROCESSING_RATE_MIXED_USE,
                $floorArea
            );
        }

        if ($this->isAgricultural($classification)) {
            return $this->buildResult(
                'Agricultural Project',
                $classification,
                self::VERIFICATION_FEE_STANDARD,
                self::PROCESSING_RATE_AGRICULTURAL,
                $floorArea
            );
        }

        if ($this->isResidentialApartment($classification, $data)) {
            return $this->buildResult(
                'Residential Apartment',
                $classification,
                self::VERIFICATION_FEE_STANDARD,
                self::PROCESSING_RATE_RESIDENTIAL,
                $floorArea
            );
        }

        // Default: Residential House (R1/R2)
        return $this->buildResult(
            'Residential House',
            $classification ?? 'N/A',
            self::VERIFICATION_FEE_STANDARD,
            self::PROCESSING_RATE_RESIDENTIAL,
            $floorArea
        );
    }

    /**
     * Build a standardised fee result.
     * Total = Filing Fee + Verification Fee + Inspection Fee + Processing Fee
     */
    private function buildResult(
        string $type,
        ?string $classification,
        int $verificationFee,
        float $processingRate,
        float $floorArea
    ): array {
        $processingFee = $processingRate * $floorArea;
        $total = $verificationFee + self::INSPECTION_FEE + $processingFee;

        return [
            'amount' => $total,
            'currency' => 'PHP',
            'breakdown' => [
                'type' => $type,
                'classification' => $classification ?? 'N/A',
                'verification_fee' => $verificationFee,
                'inspection_fee' => self::INSPECTION_FEE,
                'processing_fee' => $processingFee,
                'processing_rate' => $processingRate,
                'floor_area_sqm' => $floorArea,
                'total' => $total,
            ],
        ];
    }

    /**
     * Subdivision projects use a separate fee schedule.
     */
    private function calculateSubdivisionFee(array $data, ?string $classification): array
    {
        $lots = max(0, (int) ($data['total_lots_planned'] ?? 0));
        $lotFee = 5 * $lots;
        $subdivisionBase = 1000;
        $total = self::VERIFICATION_FEE_STANDARD + self::INSPECTION_FEE + $subdivisionBase + $lotFee;

        return [
            'amount' => $total,
            'currency' => 'PHP',
            'breakdown' => [
                'type' => 'Subdivision Project',
                'classification' => $classification ?? 'N/A',
                'filing_fee' => self::FILING_FEE,
                'verification_fee' => self::VERIFICATION_FEE_STANDARD,
                'inspection_fee' => self::INSPECTION_FEE,
                'processing_fee' => $subdivisionBase + $lotFee,
                'processing_rate' => 5,
                'floor_area_sqm' => 0,
                'lots_planned' => $lots,
                'subdivision_base' => $subdivisionBase,
                'lot_fee' => $lotFee,
                'total' => $total,
            ],
        ];
    }

    private function isIndustrial(?string $code): bool
    {
        if (! $code) {
            return false;
        }

        return \in_array(strtoupper($code), ['I1', 'I2', 'I-1', 'I-2']);
    }

    private function isCommercial(?string $code): bool
    {
        if (! $code) {
            return false;
        }

        return preg_match('/^C-?[1-3]$/i', $code) === 1;
    }

    private function isResidentialApartment(?string $code, array $data): bool
    {
        if (($data['project_type'] ?? '') === 'apartment') {
            return true;
        }

        if (! $code) {
            return false;
        }

        return preg_match('/^R-?[3-4]$/i', $code) === 1;
    }

    private function isMixedUse(?string $code): bool
    {
        if (! $code) {
            return false;
        }

        return strtoupper($code) === 'MU';
    }

    private function isInstitutional(?string $code): bool
    {
        if (! $code) {
            return false;
        }

        return strtoupper($code) === 'INS';
    }

    private function isAgricultural(?string $code): bool
    {
        if (! $code) {
            return false;
        }

        return \in_array(strtoupper($code), ['A1', 'A2', 'A-1', 'A-2']);
    }
}
