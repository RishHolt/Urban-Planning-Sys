<?php

namespace App\Services;

use App\Models\BeneficiaryApplication;
use App\Models\SiteVisit;

class SiteVisitService
{
    /**
     * Schedule a site visit.
     */
    public function scheduleVisit(
        BeneficiaryApplication $application,
        int $visitedBy,
        \DateTime $scheduledDate,
        string $addressVisited
    ): SiteVisit {
        $visit = SiteVisit::create([
            'beneficiary_id' => $application->beneficiary_id,
            'application_id' => $application->id,
            'visited_by' => $visitedBy,
            'scheduled_date' => $scheduledDate,
            'address_visited' => $addressVisited,
            'status' => 'scheduled',
        ]);

        // Update application status
        $application->update(['application_status' => 'site_visit_scheduled']);

        return $visit;
    }

    /**
     * Record site visit completion.
     */
    public function completeVisit(
        SiteVisit $visit,
        string $livingConditions,
        string $findings,
        string $recommendation,
        ?string $remarks = null
    ): SiteVisit {
        $visit->update([
            'visit_date' => now(),
            'living_conditions' => $livingConditions,
            'findings' => $findings,
            'recommendation' => $recommendation,
            'remarks' => $remarks,
            'status' => 'completed',
        ]);

        // Update application based on recommendation
        $application = $visit->application;
        $application->update(['application_status' => 'site_visit_completed']);

        if ($recommendation === 'eligible') {
            $application->update([
                'eligibility_status' => 'eligible',
                'application_status' => 'verified',
            ]);
        } elseif ($recommendation === 'not_eligible') {
            $application->update([
                'eligibility_status' => 'not_eligible',
                'application_status' => 'rejected',
                'denial_reason' => "Site visit failed: {$findings}",
            ]);
        }
        // 'needs_followup' - application remains in current status

        return $visit;
    }

    /**
     * Cancel a site visit.
     */
    public function cancelVisit(SiteVisit $visit, ?string $reason = null): bool
    {
        $visit->update([
            'status' => 'cancelled',
            'remarks' => $reason ? ($visit->remarks ? $visit->remarks."\nCancelled: {$reason}" : "Cancelled: {$reason}") : $visit->remarks,
        ]);

        return true;
    }
}
