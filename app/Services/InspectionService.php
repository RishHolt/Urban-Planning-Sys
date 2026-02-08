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

            // Check if application already has an inspection
            if ($application->inspection) {
                throw new \Exception('This application already has an inspection scheduled.');
            }

            // Validate application is in a valid status for inspection
            if (! in_array($application->status, ['for_inspection', 'under_review'])) {
                throw new \Exception('Application must be in "for_inspection" or "under_review" status to schedule an inspection.');
            }

            // Create inspection
            $inspection = Inspection::create([
                'application_id' => $applicationId,
                'inspector_id' => $inspectorId,
                'scheduled_date' => $scheduledDate,
                'result' => 'pending',
                'inspection_status' => 'pending',
            ]);

            // Update application status to 'for_inspection' if not already
            if ($application->status !== 'for_inspection') {
                $application->update(['status' => 'for_inspection']);
            }

            // Create history record
            ApplicationHistory::create([
                'application_id' => $application->id,
                'status' => 'for_inspection',
                'remarks' => "Inspection scheduled for {$scheduledDate}".($notes ? ". Notes: {$notes}" : ''),
                'updated_by' => auth()->id(),
                'updated_at' => now(),
            ]);

            // Notify inspector
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

            // Notify applicant
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

            // Update application status based on result
            $application = $inspection->clearanceApplication;
            if ($result === 'passed') {
                $application->update(['status' => 'approved']);
                $status = 'approved';
                $remarks = 'Inspection passed. Ready for clearance issuance.';
            } else {
                $application->update(['status' => 'denied']);
                $status = 'denied';
                $remarks = 'Inspection failed: '.($findings ?? 'No findings provided');
            }

            // Create history record
            ApplicationHistory::create([
                'application_id' => $application->id,
                'status' => $status,
                'remarks' => $remarks,
                'updated_by' => auth()->id(),
                'updated_at' => now(),
            ]);

            // Notify applicant
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
