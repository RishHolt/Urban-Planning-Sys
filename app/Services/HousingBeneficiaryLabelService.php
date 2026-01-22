<?php

namespace App\Services;

class HousingBeneficiaryLabelService
{
    /**
     * Get the label for application type.
     */
    public static function getApplicationTypeLabel(?string $type): string
    {
        return match ($type) {
            'individual' => 'Individual',
            'household' => 'Household',
            default => $type ?? 'N/A',
        };
    }

    /**
     * Get the label for application status.
     */
    public static function getStatusLabel(?string $status): string
    {
        return match ($status) {
            'draft' => 'Draft',
            'submitted' => 'Submitted',
            'under_review' => 'Under Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            default => $status ?? 'N/A',
        };
    }

    /**
     * Get the label for employment status.
     */
    public static function getEmploymentStatusLabel(?string $status): string
    {
        return match ($status) {
            'employed' => 'Employed',
            'unemployed' => 'Unemployed',
            'self_employed' => 'Self-Employed',
            'retired' => 'Retired',
            'student' => 'Student',
            'other' => 'Other',
            default => $status ?? 'N/A',
        };
    }

    /**
     * Get the label for gender.
     */
    public static function getGenderLabel(?string $gender): string
    {
        return match ($gender) {
            'male' => 'Male',
            'female' => 'Female',
            'other' => 'Other',
            default => $gender ?? 'N/A',
        };
    }

    /**
     * Get the label for document type.
     */
    public static function getDocumentTypeLabel(?string $type): string
    {
        return match ($type) {
            'proof_of_identity' => 'Proof of Identity',
            'proof_of_income' => 'Proof of Income',
            'proof_of_residence' => 'Proof of Residence',
            'special_eligibility_certificate' => 'Special Eligibility Certificate',
            'requested_documents' => 'Requested Documents',
            default => $type ? str_replace('_', ' ', ucwords($type, '_')) : 'N/A',
        };
    }

    /**
     * Get the label for document status.
     */
    public static function getDocumentStatusLabel(?string $status): string
    {
        return match ($status) {
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            default => $status ?? 'N/A',
        };
    }
}
