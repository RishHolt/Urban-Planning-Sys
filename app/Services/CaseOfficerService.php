<?php

namespace App\Services;

use App\Models\BeneficiaryApplication;
use Illuminate\Support\Facades\DB;

class CaseOfficerService
{
    /**
     * Assign a case officer to an application.
     */
    public function assignCaseOfficer(BeneficiaryApplication $application, int $caseOfficerId): void
    {
        $application->update(['case_officer_id' => $caseOfficerId]);
    }

    /**
     * Auto-assign a case officer based on workload balancing.
     */
    public function autoAssignCaseOfficer(BeneficiaryApplication $application): ?int
    {
        // Get available case officers (users with housing_officer or social_worker role)
        $caseOfficers = DB::connection('user_db')
            ->table('users')
            ->whereIn('role', ['housing_officer', 'social_worker'])
            ->where('is_active', true)
            ->get();

        if ($caseOfficers->isEmpty()) {
            return null;
        }

        // Get workload for each case officer
        $workloads = [];
        foreach ($caseOfficers as $officer) {
            $workload = BeneficiaryApplication::where('case_officer_id', $officer->id)
                ->whereIn('application_status', [
                    'submitted',
                    'under_review',
                    'verified',
                ])
                ->count();

            $workloads[$officer->id] = $workload;
        }

        // Assign to officer with least workload
        $assignedOfficerId = array_keys($workloads, min($workloads))[0];
        $this->assignCaseOfficer($application, $assignedOfficerId);

        return $assignedOfficerId;
    }

    /**
     * Get workload statistics for case officers.
     */
    public function getWorkloadStatistics(): array
    {
        $officers = DB::connection('user_db')
            ->table('users')
            ->whereIn('role', ['housing_officer', 'social_worker'])
            ->where('is_active', true)
            ->get();

        $statistics = [];

        foreach ($officers as $officer) {
            $statistics[] = [
                'officer_id' => $officer->id,
                'officer_name' => "{$officer->first_name} {$officer->last_name}",
                'total_applications' => BeneficiaryApplication::where('case_officer_id', $officer->id)->count(),
                'pending_applications' => BeneficiaryApplication::where('case_officer_id', $officer->id)
                    ->whereIn('application_status', ['submitted', 'under_review', 'verified'])
                    ->count(),
                'completed_applications' => BeneficiaryApplication::where('case_officer_id', $officer->id)
                    ->whereIn('application_status', ['approved', 'rejected', 'cancelled'])
                    ->count(),
            ];
        }

        return $statistics;
    }

    /**
     * Get assignment history for an application.
     */
    public function getAssignmentHistory(BeneficiaryApplication $application): array
    {
        // This could be enhanced with a dedicated assignment_history table
        // For now, we'll use audit logs
        return \App\Models\AuditLog::where('resource_type', 'beneficiary_application')
            ->where('resource_id', (string) $application->id)
            ->where('action', 'case_officer_assigned')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'case_officer_id' => $log->changes['case_officer_id'] ?? null,
                    'assigned_at' => $log->created_at,
                    'assigned_by' => $log->user_id,
                ];
            })
            ->toArray();
    }
}
