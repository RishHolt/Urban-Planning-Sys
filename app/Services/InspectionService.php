<?php

namespace App\Services;

use App\Models\ApplicationHistory;
use App\Models\Inspection;
use App\Models\User;
use App\Models\ZoningApplication;
use Illuminate\Support\Facades\DB;

class InspectionService
{
    /**
     * Schedule an inspection and notify inspector and applicant.
     */
    public function scheduleInspection(
        int $applicationId,
        int $inspectorId,
        string $scheduledDate,
        ?string $notes = null
    ): Inspection {
        DB::beginTransaction();

        try {
            $application = ZoningApplication::findOrFail($applicationId);

            if (! in_array($application->status, ['for_inspection', 'under_review', 'for_approval'], true)) {
                throw new \Exception('Application must be in "For Inspection", "Under Review", or "For Approval" status to schedule an inspection.');
            }

            $inspection = Inspection::create([
                'application_id' => $applicationId,
                'inspector_id' => $inspectorId,
                'scheduled_date' => $scheduledDate,
                'result' => 'pending',
                'inspection_status' => 'pending',
            ]);

            if ($application->status !== 'for_inspection') {
                $application->update(['status' => 'for_inspection']);
            }

            ApplicationHistory::create([
                'application_id' => $application->id,
                'event_type' => 'status_change',
                'status' => 'for_inspection',
                'remarks' => 'Inspection scheduled for '.$scheduledDate.($notes ? ". Notes: {$notes}" : ''),
                'updated_by' => auth()->id() ?? $inspectorId,
                'updated_at' => now(),
            ]);

            $inspector = User::find($inspectorId);
            if ($inspector) {
                NotificationService::create(
                    $inspectorId,
                    'inspection_scheduled',
                    'New Inspection Scheduled',
                    "You have been assigned to inspect application {$application->reference_no} on {$scheduledDate}.",
                    'inspection',
                    $inspection->id
                );
            }

            if ($application->user_id) {
                NotificationService::create(
                    $application->user_id,
                    'inspection_scheduled',
                    'Inspection Scheduled',
                    "An inspection has been scheduled for your application {$application->reference_no} on {$scheduledDate}.",
                    'zoning_application',
                    $application->id
                );
            }

            DB::commit();

            return $inspection;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Complete an inspection and update status.
     */
    public function completeInspection(
        Inspection $inspection,
        string $result,
        ?string $findings = null,
        ?string $recommendations = null
    ): void {
        DB::beginTransaction();

        try {
            $inspection->update([
                'result' => $result,
                'findings' => $findings,
                'recommendations' => $recommendations,
                'inspected_at' => now(),
                'inspection_status' => 'completed',
                'completed_at' => now(),
            ]);

            $application = $inspection->clearanceApplication;
            if ($result === 'passed') {
                $application->update(['status' => 'for_approval']);
                $status = 'for_approval';
                $remarks = 'Inspection passed. Application moved to For Approval for final admin review.';
            } else {
                // Keep in for_inspection so admin can decide on re-inspection or rejection
                $status = 'for_inspection';
                $remarks = 'Inspection failed: '.($findings ?? 'No findings provided').'. Application returned for review.';
            }

            ApplicationHistory::create([
                'application_id' => $application->id,
                'event_type' => 'status_change',
                'status' => $status,
                'remarks' => $remarks,
                'updated_by' => auth()->id() ?? $application->user_id,
                'updated_at' => now(),
            ]);

            if ($application->user_id) {
                NotificationService::create(
                    $application->user_id,
                    'inspection_completed',
                    'Inspection Completed',
                    "The inspection for your application {$application->reference_no} has been completed. Result: ".ucfirst($result).'.',
                    'zoning_application',
                    $application->id
                );
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Review an inspection (admin/staff review).
     */
    public function reviewInspection(
        Inspection $inspection,
        string $reviewNotes
    ): void {
        $inspection->update([
            'inspection_status' => 'reviewed',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'review_notes' => $reviewNotes,
        ]);
    }
}
