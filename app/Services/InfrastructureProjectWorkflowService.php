<?php

namespace App\Services;

use App\Models\InfrastructureProject;
use App\Models\ProjectPhase;
use Illuminate\Support\Facades\DB;

class InfrastructureProjectWorkflowService
{
    /**
     * Valid workflow transitions.
     */
    private const VALID_TRANSITIONS = [
        'planning' => ['approved', 'cancelled'],
        'approved' => ['bidding', 'cancelled'],
        'bidding' => ['contract_signed', 'cancelled'],
        'contract_signed' => ['ongoing', 'cancelled'],
        'ongoing' => ['suspended', 'delayed', 'completed'],
        'suspended' => ['ongoing', 'cancelled'],
        'delayed' => ['ongoing', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
    ];

    /**
     * Update project status with workflow validation.
     */
    public function updateProjectStatus(InfrastructureProject $project, string $newStatus): bool
    {
        $currentStatus = $project->status;

        // Validate transition
        if (! $this->isValidTransition($currentStatus, $newStatus)) {
            throw new \InvalidArgumentException("Invalid status transition from {$currentStatus} to {$newStatus}");
        }

        DB::beginTransaction();

        try {
            $project->update(['status' => $newStatus]);

            // Handle automatic actions based on status change
            $this->handleStatusChangeActions($project, $currentStatus, $newStatus);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Check if a status transition is valid.
     */
    public function isValidTransition(string $currentStatus, string $newStatus): bool
    {
        if (! isset(self::VALID_TRANSITIONS[$currentStatus])) {
            return false;
        }

        return in_array($newStatus, self::VALID_TRANSITIONS[$currentStatus]);
    }

    /**
     * Handle automatic actions when project status changes.
     */
    protected function handleStatusChangeActions(InfrastructureProject $project, string $oldStatus, string $newStatus): void
    {
        // When project moves to "ongoing", create Construction phase if not exists
        if ($newStatus === 'ongoing' && $oldStatus !== 'ongoing') {
            $this->ensureConstructionPhase($project);
        }

        // When project moves to "completed", mark all phases as completed
        if ($newStatus === 'completed') {
            $this->completeAllPhases($project);
        }
    }

    /**
     * Ensure Construction phase exists for the project.
     */
    protected function ensureConstructionPhase(InfrastructureProject $project): void
    {
        $constructionPhase = $project->phases()
            ->where('phase_type', 'construction')
            ->first();

        if (! $constructionPhase) {
            $maxSequence = $project->phases()->max('sequence_order') ?? 0;

            ProjectPhase::create([
                'project_id' => $project->id,
                'phase_name' => 'Construction',
                'phase_type' => 'construction',
                'sequence_order' => $maxSequence + 1,
                'status' => 'pending',
                'progress_percentage' => 0,
            ]);
        }
    }

    /**
     * Complete all phases for a project.
     */
    protected function completeAllPhases(InfrastructureProject $project): void
    {
        $project->phases()
            ->where('status', '!=', 'completed')
            ->update([
                'status' => 'completed',
                'actual_end_date' => now(),
                'progress_percentage' => 100,
            ]);
    }

    /**
     * Check if project should move to next status based on phase completion.
     */
    public function checkPhaseCompletion(InfrastructureProject $project): ?string
    {
        $phases = $project->phases()->orderBy('sequence_order')->get();

        if ($phases->isEmpty()) {
            return null;
        }

        // Check if all phases are completed
        $allCompleted = $phases->every(function ($phase) {
            return $phase->status === 'completed';
        });

        if ($allCompleted && $project->status !== 'completed') {
            return 'completed';
        }

        return null;
    }

    /**
     * Update phase progress and check if phase should be completed.
     */
    public function updatePhaseProgress(ProjectPhase $phase, float $progressPercentage): void
    {
        $phase->update(['progress_percentage' => $progressPercentage]);

        // Auto-complete phase if progress reaches 100%
        if ($progressPercentage >= 100 && $phase->status !== 'completed') {
            $phase->update([
                'status' => 'completed',
                'actual_end_date' => now(),
            ]);

            // Check if project should move to next status
            $project = $phase->project;
            $suggestedStatus = $this->checkPhaseCompletion($project);

            if ($suggestedStatus) {
                // Don't auto-update, just log or notify
                // Admin should manually update project status
            }
        }
    }

    /**
     * Mark milestone as achieved and update phase progress.
     */
    public function markMilestoneAchieved(\App\Models\PhaseMilestone $milestone): void
    {
        $milestone->update([
            'status' => 'achieved',
            'actual_date' => now(),
        ]);

        // Update phase progress based on milestones
        $phase = $milestone->phase;
        $totalMilestones = $phase->milestones()->count();
        $achievedMilestones = $phase->milestones()->where('status', 'achieved')->count();

        if ($totalMilestones > 0) {
            $progressPercentage = ($achievedMilestones / $totalMilestones) * 100;
            $this->updatePhaseProgress($phase, $progressPercentage);
        }
    }
}
