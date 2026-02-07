<?php

namespace App\Services;

use App\Models\Allocation;
use App\Models\Award;
use App\Models\BeneficiaryApplication;
use App\Models\HousingUnit;

class AwardService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Generate an award for an approved application.
     */
    public function generateAward(
        BeneficiaryApplication $application,
        HousingUnit $unit,
        Allocation $allocation,
        int $generatedBy,
        ?\DateTime $turnoverDate = null
    ): Award {
        $award = Award::create([
            'beneficiary_id' => $application->beneficiary_id,
            'application_id' => $application->id,
            'allocation_id' => $allocation->id,
            'project_id' => $unit->project_id,
            'unit_id' => $unit->id,
            'award_status' => 'generated',
            'award_date' => now(),
            'acceptance_deadline' => now()->addDays(30), // 30 days to accept
            'turnover_date' => $turnoverDate,
            'generated_by' => $generatedBy,
        ]);

        // Update application status
        $application->update(['application_status' => \App\ApplicationStatus::Approved]);

        return $award;
    }

    /**
     * Approve an award (committee or single approver).
     */
    public function approveAward(Award $award, int $approvedBy, ?string $remarks = null): void
    {
        $award->approve($approvedBy, $remarks);

        // Send notification to beneficiary
        if ($award->beneficiary->citizen_id) {
            $this->notificationService->notifyAwardApproval(
                $award->beneficiary->citizen_id,
                $award->award_no,
                $award->id
            );
        }

        $award->update([
            'notification_sent' => true,
            'notification_sent_at' => now(),
        ]);
    }

    /**
     * Reject an award.
     */
    public function rejectAward(Award $award, int $rejectedBy, string $reason): void
    {
        $award->update([
            'award_status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        // Send notification to beneficiary
        if ($award->beneficiary->citizen_id) {
            $this->notificationService->notifyAwardRejection(
                $award->beneficiary->citizen_id,
                $award->award_no,
                $reason,
                $award->id
            );
        }
    }

    /**
     * Track award acceptance by beneficiary.
     */
    public function acceptAward(Award $award, ?string $remarks = null): void
    {
        $award->accept($remarks);

        // Update allocation status
        if ($award->allocation) {
            $award->allocation->update(['allocation_status' => 'accepted']);
        }

        // Send notification to admin
        $this->notificationService->notifyAwardAcceptance(
            $award->award_no,
            $award->id
        );
    }

    /**
     * Track award decline by beneficiary.
     */
    public function declineAward(Award $award, string $reason): void
    {
        $award->decline($reason);

        // Free up the unit
        if ($award->unit) {
            $award->unit->update(['status' => 'available']);
        }

        // Update allocation status
        if ($award->allocation) {
            $award->allocation->update(['allocation_status' => 'declined']);
        }

        // Send notification to admin
        $this->notificationService->notifyAwardDecline(
            $award->award_no,
            $reason,
            $award->id
        );
    }

    /**
     * Schedule unit turnover.
     */
    public function scheduleTurnover(Award $award, \DateTime $turnoverDate): void
    {
        $award->update(['turnover_date' => $turnoverDate]);

        // Send notification to beneficiary
        if ($award->beneficiary->citizen_id) {
            $this->notificationService->notifyTurnoverScheduled(
                $award->beneficiary->citizen_id,
                $award->award_no,
                $turnoverDate,
                $award->id
            );
        }
    }
}
