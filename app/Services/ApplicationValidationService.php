<?php

namespace App\Services;

use App\DataTransferObjects\ValidationResult;
use App\Models\BeneficiaryApplication;

class ApplicationValidationService
{
    public function __construct(
        protected DuplicateCheckService $duplicateCheckService
    ) {}

    /**
     * Validate a beneficiary application.
     */
    public function validateApplication(BeneficiaryApplication $application): ValidationResult
    {
        $beneficiary = $application->beneficiary;
        $missingFields = [];
        $missingDocuments = [];
        $validationErrors = [];
        $duplicateWarnings = [];

        // Check mandatory fields
        $mandatoryFields = config('housing.validation.mandatory_fields', []);
        $missingFields = $this->checkMandatoryFields($beneficiary, $mandatoryFields);

        // Check document requirements
        $missingDocuments = $this->checkDocumentRequirements($application);

        // Check for duplicates
        $duplicateResult = $this->duplicateCheckService->checkDuplicates($beneficiary);
        if ($duplicateResult->hasDuplicates) {
            $duplicateWarnings = $duplicateResult->potentialDuplicates;
        }

        // Determine readiness status
        $readinessStatus = $this->determineReadinessStatus(
            $missingFields,
            $missingDocuments,
            $duplicateWarnings
        );

        // Overall validation
        $isValid = empty($missingFields) && empty($missingDocuments);

        // Generate summary
        $summary = $this->generateSummary($isValid, $readinessStatus, $missingFields, $missingDocuments, $duplicateWarnings);

        return new ValidationResult(
            isValid: $isValid,
            readinessStatus: $readinessStatus,
            missingFields: $missingFields,
            missingDocuments: $missingDocuments,
            duplicateWarnings: $duplicateWarnings,
            validationErrors: $validationErrors,
            summary: $summary
        );
    }

    /**
     * Check mandatory fields.
     */
    protected function checkMandatoryFields($beneficiary, array $mandatoryFields): array
    {
        $missing = [];

        foreach ($mandatoryFields as $field) {
            $value = $beneficiary->$field ?? null;

            if ($value === null || $value === '' || $value === false) {
                $missing[] = [
                    'field' => $field,
                    'label' => $this->getFieldLabel($field),
                    'message' => "Required field '{$field}' is missing or empty",
                ];
            }
        }

        return $missing;
    }

    /**
     * Check document requirements.
     */
    protected function checkDocumentRequirements(BeneficiaryApplication $application): array
    {
        $missing = [];
        $program = $application->housing_program;
        $requiredDocs = config("housing.required_documents.{$program}", []);

        $uploadedDocs = $application->documents()
            ->pluck('document_type')
            ->toArray();

        foreach ($requiredDocs as $docType) {
            if (! in_array($docType, $uploadedDocs)) {
                $missing[] = [
                    'document_type' => $docType,
                    'label' => $this->getDocumentLabel($docType),
                    'message' => "Required document '{$docType}' is missing",
                ];
            } else {
                // Check if document is verified
                $doc = $application->documents()
                    ->where('document_type', $docType)
                    ->first();

                if ($doc && $doc->verification_status === 'invalid') {
                    $missing[] = [
                        'document_type' => $docType,
                        'label' => $this->getDocumentLabel($docType),
                        'message' => "Document '{$docType}' has been rejected and needs to be replaced",
                    ];
                }
            }
        }

        return $missing;
    }

    /**
     * Determine readiness status.
     */
    protected function determineReadinessStatus(
        array $missingFields,
        array $missingDocuments,
        array $duplicateWarnings
    ): string {
        if (! empty($duplicateWarnings)) {
            return 'has_duplicates';
        }

        if (! empty($missingDocuments)) {
            return 'missing_documents';
        }

        if (! empty($missingFields)) {
            return 'incomplete';
        }

        return 'ready';
    }

    /**
     * Generate validation summary.
     */
    protected function generateSummary(
        bool $isValid,
        string $readinessStatus,
        array $missingFields,
        array $missingDocuments,
        array $duplicateWarnings
    ): string {
        if ($isValid && $readinessStatus === 'ready') {
            return 'Application is complete and ready for review.';
        }

        $parts = [];

        if (! empty($missingFields)) {
            $parts[] = count($missingFields).' required field(s) missing';
        }

        if (! empty($missingDocuments)) {
            $parts[] = count($missingDocuments).' required document(s) missing';
        }

        if (! empty($duplicateWarnings)) {
            $parts[] = count($duplicateWarnings).' potential duplicate(s) found';
        }

        return 'Application validation: '.implode(', ', $parts).'.';
    }

    /**
     * Get human-readable field label.
     */
    protected function getFieldLabel(string $field): string
    {
        return match ($field) {
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'middle_name' => 'Middle Name',
            'birth_date' => 'Birth Date',
            'gender' => 'Gender',
            'civil_status' => 'Civil Status',
            'email' => 'Email',
            'contact_number' => 'Contact Number',
            'current_address' => 'Current Address',
            'barangay' => 'Barangay',
            'years_of_residency' => 'Years of Residency',
            'employment_status' => 'Employment Status',
            'monthly_income' => 'Monthly Income',
            'priority_status' => 'Priority Status',
            default => ucwords(str_replace('_', ' ', $field)),
        };
    }

    /**
     * Get human-readable document label.
     */
    protected function getDocumentLabel(string $docType): string
    {
        return match ($docType) {
            'valid_id' => 'Valid ID',
            'birth_certificate' => 'Birth Certificate',
            'marriage_certificate' => 'Marriage Certificate',
            'income_proof' => 'Proof of Income',
            'barangay_certificate' => 'Barangay Certificate',
            'tax_declaration' => 'Tax Declaration',
            'dswd_certification' => 'DSWD Certification',
            'pwd_id' => 'PWD ID',
            'senior_citizen_id' => 'Senior Citizen ID',
            'solo_parent_id' => 'Solo Parent ID',
            'disaster_certificate' => 'Disaster Certificate',
            default => ucwords(str_replace('_', ' ', $docType)),
        };
    }
}
