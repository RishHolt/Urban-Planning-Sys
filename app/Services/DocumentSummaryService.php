<?php

namespace App\Services;

use App\Models\BeneficiaryApplication;
use Illuminate\Support\Collection;

class DocumentSummaryService
{
    /**
     * Calculate document summary for an application.
     */
    public function calculateSummary(BeneficiaryApplication $application): array
    {
        $program = $application->housing_program;
        $requiredDocs = config("housing.eligibility_criteria.{$program}.required_documents", []);

        $documents = $application->documents;
        $uploadedDocTypes = $documents->pluck('document_type')->toArray();

        // Check for missing documents
        $missingDocuments = array_diff($requiredDocs, $uploadedDocTypes);

        return [
            'total_uploaded' => $documents->count(),
            'total_required' => count($requiredDocs),
            'missing' => array_values($missingDocuments),
            'verified' => $documents->where('verification_status', 'verified')->count(),
            'pending' => $documents->where('verification_status', 'pending')->count(),
            'invalid' => $documents->where('verification_status', 'invalid')->count(),
        ];
    }

    /**
     * Format documents for display.
     */
    public function formatDocuments(Collection $documents): Collection
    {
        return $documents->map(function ($doc) {
            return [
                'id' => (string) $doc->id,
                'document_type' => $doc->document_type,
                'file_name' => $doc->file_name,
                'file_path' => $doc->file_path,
                'url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
                'verification_status' => $doc->verification_status,
                'verified_by' => $doc->verified_by,
                'verified_at' => $doc->verified_at?->format('Y-m-d H:i:s'),
            ];
        });
    }

    /**
     * Get required documents for a housing program.
     */
    public function getRequiredDocuments(string $program): array
    {
        return config("housing.eligibility_criteria.{$program}.required_documents", []);
    }

    /**
     * Check if all required documents are uploaded and verified.
     */
    public function isDocumentComplete(BeneficiaryApplication $application): bool
    {
        $summary = $this->calculateSummary($application);

        return $summary['total_uploaded'] >= $summary['total_required']
            && $summary['missing'] === []
            && $summary['invalid'] === 0;
    }
}
