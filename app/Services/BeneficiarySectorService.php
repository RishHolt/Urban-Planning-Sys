<?php

namespace App\Services;

use App\BeneficiarySector;
use App\Models\Beneficiary;

class BeneficiarySectorService
{
    /**
     * Detect and assign sectors to a beneficiary based on their attributes.
     */
    public function detectAndAssignSectors(Beneficiary $beneficiary): array
    {
        $sectors = [];

        // Check for senior citizen (age >= 60)
        if ($beneficiary->isSeniorCitizen()) {
            $sectors[] = BeneficiarySector::SeniorCitizen->value;
        }

        // Check for PWD (from priority_status)
        if ($beneficiary->priority_status === 'pwd' && $beneficiary->priority_id_no) {
            $sectors[] = BeneficiarySector::PWD->value;
        }

        // Check for solo parent (from priority_status)
        if ($beneficiary->priority_status === 'solo_parent' && $beneficiary->priority_id_no) {
            $sectors[] = BeneficiarySector::SoloParent->value;
        }

        // Check for disaster victim (from priority_status)
        if ($beneficiary->priority_status === 'disaster_victim') {
            $sectors[] = BeneficiarySector::DisasterAffected->value;
        }

        // Check for low income (based on monthly income threshold)
        $lowIncomeThreshold = config('housing.eligibility_criteria.socialized_housing.max_income', 30000);
        if ($beneficiary->monthly_income > 0 && $beneficiary->monthly_income <= $lowIncomeThreshold) {
            $sectors[] = BeneficiarySector::LowIncome->value;
        }

        // Check for ISF (Informal Settler) - this might need additional logic
        // For now, we'll check if they don't have existing property and meet income criteria
        if (! $beneficiary->has_existing_property && $beneficiary->monthly_income <= $lowIncomeThreshold) {
            $sectors[] = BeneficiarySector::ISF->value;
        }

        // Remove duplicates
        $sectors = array_unique($sectors);

        // Update beneficiary with detected sectors
        $beneficiary->update(['sector_tags' => array_values($sectors)]);

        return $sectors;
    }

    /**
     * Validate sector assignment for a beneficiary.
     */
    public function validateSector(Beneficiary $beneficiary, BeneficiarySector $sector): bool
    {
        return match ($sector) {
            BeneficiarySector::SeniorCitizen => $beneficiary->isSeniorCitizen(),
            BeneficiarySector::PWD => $beneficiary->priority_status === 'pwd' && ! empty($beneficiary->priority_id_no),
            BeneficiarySector::SoloParent => $beneficiary->priority_status === 'solo_parent' && ! empty($beneficiary->priority_id_no),
            BeneficiarySector::DisasterAffected => $beneficiary->priority_status === 'disaster_victim',
            BeneficiarySector::LowIncome => $this->isLowIncome($beneficiary),
            BeneficiarySector::ISF => ! $beneficiary->has_existing_property && $this->isLowIncome($beneficiary),
        };
    }

    /**
     * Check if beneficiary is low income.
     */
    private function isLowIncome(Beneficiary $beneficiary): bool
    {
        $threshold = config('housing.eligibility_criteria.socialized_housing.max_income', 30000);

        return $beneficiary->monthly_income > 0 && $beneficiary->monthly_income <= $threshold;
    }

    /**
     * Get eligibility boost for sectors (for prioritization).
     */
    public function getSectorPriorityMultiplier(Beneficiary $beneficiary): float
    {
        $multiplier = 1.0;
        $sectors = $beneficiary->getSectors();
        $program = config('housing.eligibility_criteria.socialized_housing.priority_status_multiplier', []);

        foreach ($sectors as $sector) {
            $sectorKey = match ($sector) {
                BeneficiarySector::PWD => 'pwd',
                BeneficiarySector::SeniorCitizen => 'senior_citizen',
                BeneficiarySector::SoloParent => 'solo_parent',
                BeneficiarySector::DisasterAffected => 'disaster_victim',
                default => null,
            };

            if ($sectorKey && isset($program[$sectorKey])) {
                $multiplier = max($multiplier, $program[$sectorKey]);
            }
        }

        return $multiplier;
    }
}
