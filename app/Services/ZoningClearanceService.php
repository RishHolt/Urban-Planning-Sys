<?php

namespace App\Services;

use App\Models\IssuedClearance;

class ZoningClearanceService
{
    /**
     * Verify if a zoning clearance number is valid and active.
     */
    public function verifyClearance(string $clearanceNo): bool
    {
        $clearance = IssuedClearance::where('clearance_no', $clearanceNo)
            ->where('status', 'active')
            ->first();

        if (! $clearance) {
            return false;
        }

        // Check if clearance has expired (if valid_until is set)
        if ($clearance->valid_until && $clearance->valid_until->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Get clearance details by clearance number.
     */
    public function getClearanceDetails(string $clearanceNo): ?IssuedClearance
    {
        return IssuedClearance::where('clearance_no', $clearanceNo)
            ->with('clearanceApplication')
            ->first();
    }

    /**
     * Check if clearance is valid for housing projects.
     */
    public function isValidForHousing(string $clearanceNo): bool
    {
        $clearance = $this->getClearanceDetails($clearanceNo);

        if (! $clearance || $clearance->status !== 'active') {
            return false;
        }

        // Check if expired
        if ($clearance->valid_until && $clearance->valid_until->isPast()) {
            return false;
        }

        // Optionally check if the clearance application is for a compatible project type
        $application = $clearance->clearanceApplication;
        if ($application) {
            // Allow if it's for residential, mixed-use, or subdivision development
            $allowedLandUses = ['residential', 'mixed_use'];
            $allowedProjectTypes = ['new_construction', 'subdivision_development'];

            $landUse = $application->land_use_type ?? null;
            $projectType = $application->project_type ?? null;

            // If it's a subdivision or residential, it's valid for housing
            if (in_array($landUse, $allowedLandUses) || in_array($projectType, $allowedProjectTypes)) {
                return true;
            }

            // Also check if it's explicitly a subdivision
            if ($application->is_subdivision ?? false) {
                return true;
            }
        }

        // Default: if clearance is active and not expired, allow it
        return true;
    }
}
