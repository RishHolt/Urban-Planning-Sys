<?php

namespace App\Services;

use App\BeneficiaryStatus;
use App\Models\BeneficiaryApplication;
use App\Models\Waitlist;

class WaitlistService
{
    public function __construct(
        protected HousingBeneficiaryPriorityService $priorityService
    ) {}

    /**
     * Add eligible beneficiary to waitlist.
     */
    public function addToWaitlist(BeneficiaryApplication $application): Waitlist
    {
        // Calculate priority score
        $priorityScore = $this->priorityService->calculatePriorityScore($application);

        // Get current queue position
        $queuePosition = $this->calculateQueuePosition($application->housing_program, $priorityScore);

        $waitlist = Waitlist::create([
            'beneficiary_id' => $application->beneficiary_id,
            'application_id' => $application->id,
            'housing_program' => $application->housing_program,
            'priority_score' => $priorityScore,
            'queue_position' => $queuePosition,
            'waitlist_date' => now(),
            'status' => 'active',
        ]);

        // Update beneficiary status to waitlisted (they were qualified when eligible, now waitlisted)
        $beneficiary = $application->beneficiary;
        if ($beneficiary && $beneficiary->beneficiary_status !== BeneficiaryStatus::Awarded) {
            $beneficiary->update([
                'beneficiary_status' => BeneficiaryStatus::Waitlisted,
            ]);
        }

        return $waitlist;
    }

    /**
     * Calculate queue position based on priority score.
     */
    protected function calculateQueuePosition(string $housingProgram, int $priorityScore): int
    {
        // Count how many active waitlist entries have higher or equal priority score
        $higherPriorityCount = Waitlist::where('housing_program', $housingProgram)
            ->where('status', 'active')
            ->where('priority_score', '>', $priorityScore)
            ->count();

        // Position is count + 1
        return $higherPriorityCount + 1;
    }

    /**
     * Update queue positions when a beneficiary is allocated or removed.
     */
    public function updateQueuePositions(string $housingProgram): void
    {
        $waitlistEntries = Waitlist::where('housing_program', $housingProgram)
            ->where('status', 'active')
            ->orderBy('priority_score', 'desc')
            ->orderBy('waitlist_date', 'asc')
            ->get();

        $position = 1;
        foreach ($waitlistEntries as $entry) {
            $entry->update(['queue_position' => $position]);
            $position++;
        }
    }

    /**
     * Remove from waitlist (when allocated or cancelled).
     */
    public function removeFromWaitlist(Waitlist $waitlist, string $reason = 'allocated'): void
    {
        $housingProgram = $waitlist->housing_program;

        $waitlist->update([
            'status' => $reason === 'allocated' ? 'allocated' : 'removed',
        ]);

        // Update queue positions
        $this->updateQueuePositions($housingProgram);
    }

    /**
     * Get next beneficiary in queue for a housing program.
     */
    public function getNextInQueue(string $housingProgram): ?Waitlist
    {
        return Waitlist::where('housing_program', $housingProgram)
            ->where('status', 'active')
            ->orderBy('queue_position', 'asc')
            ->first();
    }
}
