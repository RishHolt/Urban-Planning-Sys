<?php

namespace App\Services;

use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;

class BeneficiaryReportingService
{
    /**
     * Get applicants vs beneficiaries statistics.
     */
    public function getApplicantsVsBeneficiariesStats(array $filters = []): array
    {
        $query = Beneficiary::query();

        // Apply filters
        if (isset($filters['barangay'])) {
            $query->where('barangay', $filters['barangay']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('registered_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('registered_at', '<=', $filters['date_to']);
        }

        $totalApplicants = (clone $query)->count();
        $totalBeneficiaries = (clone $query)
            ->whereIn('beneficiary_status', ['qualified', 'waitlisted', 'awarded'])
            ->count();

        return [
            'total_applicants' => $totalApplicants,
            'total_beneficiaries' => $totalBeneficiaries,
            'conversion_rate' => $totalApplicants > 0 ? ($totalBeneficiaries / $totalApplicants) * 100 : 0,
        ];
    }

    /**
     * Get sector distribution statistics.
     */
    public function getSectorDistribution(array $filters = []): array
    {
        $query = Beneficiary::query();

        // Apply filters
        if (isset($filters['barangay'])) {
            $query->where('barangay', $filters['barangay']);
        }

        if (isset($filters['project_id'])) {
            $query->whereHas('applications', function ($q) use ($filters) {
                $q->where('project_id', $filters['project_id']);
            });
        }

        $beneficiaries = $query->get();

        $distribution = [
            'isf' => 0,
            'pwd' => 0,
            'senior_citizen' => 0,
            'solo_parent' => 0,
            'low_income' => 0,
            'disaster_affected' => 0,
        ];

        foreach ($beneficiaries as $beneficiary) {
            $sectors = $beneficiary->sector_tags ?? [];
            foreach ($sectors as $sector) {
                if (isset($distribution[$sector])) {
                    $distribution[$sector]++;
                }
            }
        }

        return $distribution;
    }

    /**
     * Get project occupancy rate.
     */
    public function getProjectOccupancyRate(int $projectId): array
    {
        $project = \App\Models\HousingProject::findOrFail($projectId);

        return [
            'project_id' => $projectId,
            'project_name' => $project->project_name,
            'total_units' => $project->total_units,
            'available_units' => $project->available_units,
            'allocated_units' => $project->allocated_units,
            'occupied_units' => $project->occupied_units,
            'occupancy_rate' => $project->total_units > 0
                ? ($project->occupied_units / $project->total_units) * 100
                : 0,
            'allocation_rate' => $project->total_units > 0
                ? ($project->allocated_units / $project->total_units) * 100
                : 0,
        ];
    }

    /**
     * Get approved vs rejected applications statistics.
     */
    public function getApprovalRejectionStats(array $filters = []): array
    {
        $query = BeneficiaryApplication::query();

        // Apply filters
        if (isset($filters['barangay'])) {
            $query->whereHas('beneficiary', function ($q) use ($filters) {
                $q->where('barangay', $filters['barangay']);
            });
        }

        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('submitted_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('submitted_at', '<=', $filters['date_to']);
        }

        $total = (clone $query)->count();
        $approved = (clone $query)->where('application_status', 'approved')->count();
        $rejected = (clone $query)->where('application_status', 'rejected')->count();
        $pending = (clone $query)
            ->whereIn('application_status', ['submitted', 'under_review', 'verified'])
            ->count();

        return [
            'total' => $total,
            'approved' => $approved,
            'rejected' => $rejected,
            'pending' => $pending,
            'approval_rate' => $total > 0 ? ($approved / $total) * 100 : 0,
            'rejection_rate' => $total > 0 ? ($rejected / $total) * 100 : 0,
        ];
    }

    /**
     * Get dashboard statistics.
     */
    public function getDashboardStats(): array
    {
        return [
            'total_beneficiaries' => Beneficiary::count(),
            'active_applications' => BeneficiaryApplication::whereIn('application_status', [
                'submitted',
                'under_review',
                'verified',
            ])->count(),
            'approved_applications' => BeneficiaryApplication::where('application_status', 'approved')->count(),
            'pending_awards' => \App\Models\Award::where('award_status', 'approved')
                ->whereNull('accepted_date')
                ->count(),
            'total_projects' => \App\Models\HousingProject::where('is_active', true)->count(),
            'available_units' => \App\Models\HousingUnit::where('status', 'available')->count(),
        ];
    }

    /**
     * Export data to array format (for CSV/Excel).
     */
    public function exportBeneficiaries(array $filters = []): array
    {
        $query = Beneficiary::with(['applications', 'householdMembers']);

        // Apply filters
        if (isset($filters['barangay'])) {
            $query->where('barangay', $filters['barangay']);
        }

        if (isset($filters['sector'])) {
            $query->whereJsonContains('sector_tags', $filters['sector']);
        }

        if (isset($filters['status'])) {
            $query->where('beneficiary_status', $filters['status']);
        }

        return $query->get()->map(function ($beneficiary) {
            return [
                'beneficiary_no' => $beneficiary->beneficiary_no,
                'full_name' => $beneficiary->full_name,
                'email' => $beneficiary->email,
                'contact_number' => $beneficiary->contact_number,
                'barangay' => $beneficiary->barangay,
                'sectors' => implode(', ', array_map(fn ($s) => \App\BeneficiarySector::from($s)->label(), $beneficiary->sector_tags ?? [])),
                'status' => $beneficiary->beneficiary_status?->label(),
                'total_applications' => $beneficiary->applications->count(),
                'household_size' => $beneficiary->householdMembers->count() + 1,
                'registered_at' => $beneficiary->registered_at?->format('Y-m-d'),
            ];
        })->toArray();
    }
}
