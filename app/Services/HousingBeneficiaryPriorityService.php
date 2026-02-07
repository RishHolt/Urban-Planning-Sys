<?php

namespace App\Services;

use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use Carbon\Carbon;

class HousingBeneficiaryPriorityService
{
    /**
     * Calculate priority score for a beneficiary application.
     *
     * Formula: score = (priority_multiplier * 100) + (income_factor * 50) + (residency_factor * 30) + (household_factor * 20) - (days_since_application)
     */
    public function calculatePriorityScore(BeneficiaryApplication $application): int
    {
        $beneficiary = $application->beneficiary;
        $program = $application->housing_program;

        // Get configurable weights
        $weights = config("housing.priority_scoring.{$program}.weights", [
            'priority_multiplier' => 100,
            'income_factor' => 50,
            'residency_factor' => 30,
            'household_factor' => 20,
            'sector_boost' => 25,
        ]);

        // Priority status multiplier (now uses sector-based multiplier)
        $sectorService = app(BeneficiarySectorService::class);
        $priorityMultiplier = $sectorService->getSectorPriorityMultiplier($beneficiary);
        // Also consider legacy priority_status
        $legacyMultiplier = $this->getPriorityMultiplier($beneficiary->priority_status);
        $priorityMultiplier = max($priorityMultiplier, $legacyMultiplier);

        // Income factor (lower income = higher priority)
        $incomeFactor = $this->calculateIncomeFactor($beneficiary->monthly_income);

        // Residency factor (longer residency = higher priority)
        $residencyFactor = $this->calculateResidencyFactor($beneficiary->years_of_residency);

        // Household size factor (larger household = higher priority)
        $householdFactor = $this->calculateHouseholdFactor($beneficiary);

        // Sector boost (additional points for having multiple sectors)
        $sectorBoost = $this->calculateSectorBoost($beneficiary);

        // Days since application (earlier = higher priority, but with diminishing returns)
        $daysSinceApplication = Carbon::parse($application->submitted_at)->diffInDays(now());
        $daysPenalty = min($daysSinceApplication, 365); // Cap at 1 year

        // Calculate final score using configurable weights
        $score = ($priorityMultiplier * ($weights['priority_multiplier'] ?? 100))
            + ($incomeFactor * ($weights['income_factor'] ?? 50))
            + ($residencyFactor * ($weights['residency_factor'] ?? 30))
            + ($householdFactor * ($weights['household_factor'] ?? 20))
            + ($sectorBoost * ($weights['sector_boost'] ?? 25))
            - ($daysPenalty * 0.1); // Small penalty for waiting time

        // Ensure score is non-negative
        return max(0, (int) $score);
    }

    /**
     * Calculate sector boost (additional points for multiple sectors).
     */
    protected function calculateSectorBoost(Beneficiary $beneficiary): float
    {
        $sectors = $beneficiary->getSectors();
        $sectorCount = count($sectors);

        // More sectors = higher boost, but with diminishing returns
        return match ($sectorCount) {
            0 => 0.0,
            1 => 1.0,
            2 => 2.5,
            3 => 4.0,
            4 => 5.5,
            default => 6.0, // Cap at 4+ sectors
        };
    }

    /**
     * Get priority multiplier based on priority status.
     */
    protected function getPriorityMultiplier(string $priorityStatus): float
    {
        return match ($priorityStatus) {
            'pwd' => 5.0,
            'senior_citizen' => 4.5,
            'solo_parent' => 4.0,
            'disaster_victim' => 3.5,
            'indigenous' => 3.0,
            default => 1.0, // 'none'
        };
    }

    /**
     * Calculate income factor (lower income = higher factor).
     */
    protected function calculateIncomeFactor(float $monthlyIncome): float
    {
        if ($monthlyIncome <= 10000) {
            return 5.0; // Very low income
        } elseif ($monthlyIncome <= 20000) {
            return 4.0; // Low income
        } elseif ($monthlyIncome <= 30000) {
            return 3.0; // Moderate income
        } elseif ($monthlyIncome <= 50000) {
            return 2.0; // Above moderate
        } else {
            return 1.0; // Higher income
        }
    }

    /**
     * Calculate residency factor (longer residency = higher factor).
     */
    protected function calculateResidencyFactor(int $yearsOfResidency): float
    {
        if ($yearsOfResidency >= 20) {
            return 5.0; // Very long-term resident
        } elseif ($yearsOfResidency >= 15) {
            return 4.0;
        } elseif ($yearsOfResidency >= 10) {
            return 3.0;
        } elseif ($yearsOfResidency >= 5) {
            return 2.0;
        } else {
            return 1.0; // Recent resident
        }
    }

    /**
     * Calculate household factor (larger household = higher factor).
     */
    protected function calculateHouseholdFactor(Beneficiary $beneficiary): float
    {
        $householdSize = $beneficiary->householdMembers()->count() + 1; // +1 for beneficiary

        if ($householdSize >= 7) {
            return 5.0; // Large household
        } elseif ($householdSize >= 5) {
            return 4.0;
        } elseif ($householdSize >= 3) {
            return 3.0;
        } elseif ($householdSize >= 2) {
            return 2.0;
        } else {
            return 1.0; // Single person
        }
    }
}
