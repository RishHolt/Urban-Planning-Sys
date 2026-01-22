<?php

namespace App\Services;

use App\Models\Allocation;
use App\Models\AllocationHistory;
use App\Models\BeneficiaryApplication;
use App\Models\HousingUnit;

class AllocationService
{
    /**
     * Propose an allocation (staff action).
     */
    public function proposeAllocation(
        BeneficiaryApplication $application,
        HousingUnit $unit,
        float $totalContractPrice,
        float $monthlyAmortization,
        int $amortizationMonths,
        ?string $specialConditions,
        int $allocatedBy
    ): Allocation {
        $allocation = Allocation::create([
            'beneficiary_id' => $application->beneficiary_id,
            'application_id' => $application->id,
            'unit_id' => $unit->id,
            'allocation_date' => now(),
            'acceptance_deadline' => now()->addDays(30), // 30 days to accept
            'allocation_status' => 'proposed',
            'total_contract_price' => $totalContractPrice,
            'monthly_amortization' => $monthlyAmortization,
            'amortization_months' => $amortizationMonths,
            'special_conditions' => $specialConditions,
            'allocated_by' => $allocatedBy,
        ]);

        // Update unit status
        $unit->update(['status' => 'reserved']);

        // Create history entry
        $this->createHistoryEntry($allocation, 'proposed', 'Allocation proposed by staff');

        return $allocation;
    }

    /**
     * Approve allocation (admin/committee action).
     */
    public function approveAllocation(Allocation $allocation, int $approvedBy): bool
    {
        $allocation->update([
            'allocation_status' => 'approved',
            'approved_by' => $approvedBy,
        ]);

        // Create history entry
        $this->createHistoryEntry($allocation, 'approved', 'Allocation approved by committee', $approvedBy);

        return true;
    }

    /**
     * Reject allocation (admin/committee action).
     */
    public function rejectAllocation(Allocation $allocation, string $reason, int $rejectedBy): bool
    {
        $allocation->update([
            'allocation_status' => 'rejected',
        ]);

        // Release unit
        $allocation->unit->update(['status' => 'available']);

        // Create history entry
        $this->createHistoryEntry($allocation, 'rejected', $reason, $rejectedBy);

        return true;
    }

    /**
     * Accept allocation (beneficiary action).
     */
    public function acceptAllocation(Allocation $allocation): bool
    {
        $allocation->update([
            'allocation_status' => 'accepted',
            'accepted_date' => now(),
        ]);

        // Update unit status
        $allocation->unit->update(['status' => 'allocated']);

        // Update application status
        $allocation->application->update(['application_status' => 'allocated']);

        // Remove from waitlist
        if ($waitlistEntry = $allocation->application->waitlistEntry) {
            app(WaitlistService::class)->removeFromWaitlist($waitlistEntry, 'allocated');
        }

        // Create history entry
        $this->createHistoryEntry($allocation, 'accepted', 'Allocation accepted by beneficiary');

        return true;
    }

    /**
     * Decline allocation (beneficiary action).
     */
    public function declineAllocation(Allocation $allocation): bool
    {
        $allocation->update([
            'allocation_status' => 'declined',
        ]);

        // Release unit
        $allocation->unit->update(['status' => 'available']);

        // Create history entry
        $this->createHistoryEntry($allocation, 'declined', 'Allocation declined by beneficiary');

        return true;
    }

    /**
     * Record contract signing and move-in.
     */
    public function recordMoveIn(Allocation $allocation, string $contractFilePath): bool
    {
        $allocation->update([
            'allocation_status' => 'moved_in',
            'contract_file_path' => $contractFilePath,
            'contract_signed_date' => now(),
            'move_in_date' => now(),
        ]);

        // Update unit status
        $allocation->unit->update(['status' => 'occupied']);

        // Create history entry
        $this->createHistoryEntry($allocation, 'moved_in', 'Beneficiary moved in and contract signed');

        return true;
    }

    /**
     * Create allocation history entry.
     */
    protected function createHistoryEntry(
        Allocation $allocation,
        string $status,
        string $remarks,
        ?int $updatedBy = null
    ): AllocationHistory {
        return AllocationHistory::create([
            'allocation_id' => $allocation->id,
            'status' => $status,
            'remarks' => $remarks,
            'updated_by' => $updatedBy,
            'updated_at' => now(),
        ]);
    }
}
