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

        // Priority status multiplier
        $priorityMultiplier = $this->getPriorityMultiplier($beneficiary->priority_status);

        // Income factor (lower income = higher priority)
        $incomeFactor = $this->calculateIncomeFactor($beneficiary->monthly_income);

        // Residency factor (longer residency = higher priority)
        $residencyFactor = $this->calculateResidencyFactor($beneficiary->years_of_residency);

        // Household size factor (larger household = higher priority)
        $householdFactor = $this->calculateHouseholdFactor($beneficiary);

        // Days since application (earlier = higher priority)
        $daysSinceApplication = Carbon::parse($application->submitted_at)->diffInDays(now());

        // Calculate final score
        $score = ($priorityMultiplier * 100)
            + ($incomeFactor * 50)
            + ($residencyFactor * 30)
            + ($householdFactor * 20)
            - $daysSinceApplication;

        // Ensure score is non-negative
        return max(0, (int) $score);
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
