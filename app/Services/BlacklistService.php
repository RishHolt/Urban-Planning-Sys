<?php

namespace App\Services;

use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\Blacklist;

class BlacklistService
{
    /**
     * Check if a beneficiary is blacklisted.
     */
    public function isBlacklisted(Beneficiary $beneficiary): bool
    {
        return Blacklist::where('beneficiary_id', $beneficiary->id)
            ->where('status', 'active')
            ->exists();
    }

    /**
     * Check blacklist and auto-reject application if blacklisted.
     */
    public function checkAndReject(BeneficiaryApplication $application): bool
    {
        $beneficiary = $application->beneficiary;

        if ($this->isBlacklisted($beneficiary)) {
            $blacklist = Blacklist::where('beneficiary_id', $beneficiary->id)
                ->where('status', 'active')
                ->first();

            // Update application status
            $application->update([
                'application_status' => 'not_eligible',
                'eligibility_status' => 'not_eligible',
                'denial_reason' => "Application rejected: Beneficiary is blacklisted. Reason: {$blacklist->reason}",
            ]);

            return true; // Application was rejected
        }

        return false; // Application is not blacklisted
    }

    /**
     * Add a beneficiary to the blacklist.
     */
    public function addToBlacklist(
        Beneficiary $beneficiary,
        string $reason,
        string $details,
        int $blacklistedBy
    ): Blacklist {
        // Lift any existing blacklist first
        $this->liftBlacklist($beneficiary, $blacklistedBy, 'Replaced by new blacklist entry');

        return Blacklist::create([
            'beneficiary_id' => $beneficiary->id,
            'reason' => $reason,
            'details' => $details,
            'blacklisted_date' => now(),
            'status' => 'active',
            'blacklisted_by' => $blacklistedBy,
        ]);
    }

    /**
     * Lift a blacklist entry.
     */
    public function liftBlacklist(
        Beneficiary $beneficiary,
        int $liftedBy,
        ?string $liftRemarks = null
    ): bool {
        $blacklist = Blacklist::where('beneficiary_id', $beneficiary->id)
            ->where('status', 'active')
            ->first();

        if ($blacklist) {
            $blacklist->update([
                'status' => 'lifted',
                'lifted_date' => now(),
                'lifted_by' => $liftedBy,
                'lift_remarks' => $liftRemarks,
            ]);

            return true;
        }

        return false;
    }

    /**
     * Get active blacklist entry for a beneficiary.
     */
    public function getActiveBlacklist(Beneficiary $beneficiary): ?Blacklist
    {
        return Blacklist::where('beneficiary_id', $beneficiary->id)
            ->where('status', 'active')
            ->first();
    }
}
