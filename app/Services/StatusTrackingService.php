<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\BeneficiaryApplication;

class StatusTrackingService
{
    /**
     * Update application status with comprehensive tracking.
     */
    public function updateStatus(
        BeneficiaryApplication $application,
        string $newStatus,
        ?string $reason = null,
        ?int $updatedBy = null
    ): void {
        $oldStatus = $application->application_status;
        $updatedBy = $updatedBy ?? auth()->id();

        // Validate status transition
        if (! $this->isValidStatusTransition($oldStatus, $newStatus)) {
            throw new \InvalidArgumentException("Invalid status transition from '{$oldStatus}' to '{$newStatus}'");
        }

        // Update application status
        $updateData = [
            'application_status' => $newStatus,
        ];

        // Update relevant timestamps based on status
        if ($newStatus === 'under_review' && ! $application->reviewed_at) {
            $updateData['reviewed_by'] = $updatedBy;
            $updateData['reviewed_at'] = now();
        }

        if ($newStatus === 'eligible' && $application->eligibility_status === 'eligible') {
            $updateData['approved_by'] = $updatedBy;
            $updateData['approved_at'] = now();
        }

        $application->update($updateData);

        // Log to audit log
        AuditLog::create([
            'user_id' => $updatedBy,
            'action' => 'status_updated',
            'resource_type' => 'beneficiary_application',
            'resource_id' => (string) $application->id,
            'changes' => [
                'status_from' => $oldStatus,
                'status_to' => $newStatus,
                'reason' => $reason,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Notify beneficiary if status changed
        if ($oldStatus !== $newStatus && $application->beneficiary->citizen_id) {
            NotificationService::notifyApplicationStatusChange(
                $application->beneficiary->citizen_id,
                $application->application_no,
                $oldStatus,
                $newStatus,
                $application->id
            );
        }
    }

    /**
     * Check if status transition is valid.
     */
    protected function isValidStatusTransition(string $from, string $to): bool
    {
        $validTransitions = [
            'submitted' => ['under_review', 'cancelled'],
            'under_review' => ['site_visit_scheduled', 'eligible', 'not_eligible', 'cancelled'],
            'site_visit_scheduled' => ['site_visit_completed', 'cancelled'],
            'site_visit_completed' => ['eligible', 'not_eligible', 'cancelled'],
            'eligible' => ['waitlisted', 'not_eligible', 'cancelled'],
            'not_eligible' => ['cancelled'],
            'waitlisted' => ['allocated', 'cancelled'],
            'allocated' => ['cancelled'],
            'cancelled' => [], // Terminal state
        ];

        return in_array($to, $validTransitions[$from] ?? []);
    }

    /**
     * Get status history for an application.
     */
    public function getStatusHistory(BeneficiaryApplication $application): array
    {
        // Get audit logs related to this application
        $logs = AuditLog::where('resource_type', 'beneficiary_application')
            ->where('resource_id', (string) $application->id)
            ->where('action', 'status_updated')
            ->orderBy('created_at', 'asc')
            ->get();

        $history = [];

        // Add initial submission
        $history[] = [
            'status' => 'submitted',
            'changed_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
            'changed_by' => null,
            'reason' => 'Application submitted',
        ];

        // Add status changes from audit logs
        foreach ($logs as $log) {
            $changes = $log->changes ?? [];
            $history[] = [
                'status' => $changes['status_to'] ?? null,
                'changed_at' => $log->created_at->format('Y-m-d H:i:s'),
                'changed_by' => $log->user_id,
                'reason' => $changes['reason'] ?? null,
            ];
        }

        return $history;
    }
}
