<?php

namespace App\Services;

use App\BeneficiarySector;
use App\DataTransferObjects\EligibilityResult;
use App\Models\BeneficiaryApplication;

class EligibilityService
{
    /**
     * Check eligibility of a beneficiary application.
     */
    public function checkEligibility(BeneficiaryApplication $application): EligibilityResult
    {
        $beneficiary = $application->beneficiary;
        $program = $application->housing_program;
        $criteria = config("housing.eligibility_criteria.{$program}", []);

        if (empty($criteria)) {
            return new EligibilityResult(
                isEligible: false,
                determination: 'not_eligible',
                reasons: ['Invalid housing program specified'],
                failedCriteria: ['program_validation'],
            );
        }

        $reasons = [];
        $failedCriteria = [];
        $passedCriteria = [];

        // Check income eligibility
        $householdIncome = $this->calculateHouseholdIncome($beneficiary);
        if (isset($criteria['max_income']) && $householdIncome > $criteria['max_income']) {
            $failedCriteria[] = 'income';
            $reasons[] = "Household income ({$householdIncome}) exceeds maximum allowed ({$criteria['max_income']})";
        } else {
            $passedCriteria[] = 'income';
        }

        // Check residency requirement
        if (isset($criteria['min_residency_years']) && $beneficiary->years_of_residency < $criteria['min_residency_years']) {
            $failedCriteria[] = 'residency';
            $reasons[] = "Years of residency ({$beneficiary->years_of_residency}) is less than required ({$criteria['min_residency_years']})";
        } else {
            $passedCriteria[] = 'residency';
        }

        // Check family size
        $familySize = $beneficiary->householdMembers()->count() + 1; // +1 for beneficiary
        if (isset($criteria['min_family_size']) && $familySize < $criteria['min_family_size']) {
            $failedCriteria[] = 'family_size';
            $reasons[] = "Family size ({$familySize}) is less than minimum required ({$criteria['min_family_size']})";
        } else {
            $passedCriteria[] = 'family_size';
        }

        if (isset($criteria['max_family_size']) && $criteria['max_family_size'] !== null && $familySize > $criteria['max_family_size']) {
            $failedCriteria[] = 'family_size';
            $reasons[] = "Family size ({$familySize}) exceeds maximum allowed ({$criteria['max_family_size']})";
        }

        // Check existing property requirement
        if (isset($criteria['requires_existing_property']) && $criteria['requires_existing_property'] === false && $beneficiary->has_existing_property) {
            $failedCriteria[] = 'existing_property';
            $reasons[] = 'Applicant has existing property, which disqualifies them from this program';
        } else {
            $passedCriteria[] = 'existing_property';
        }

        // Check document completeness
        $documentCheck = $this->checkRequiredDocuments($application, $program);
        if (! $documentCheck['complete']) {
            $failedCriteria[] = 'documents';
            $reasons[] = 'Required documents are missing or incomplete';
            $reasons = array_merge($reasons, $documentCheck['missing']);
        } else {
            $passedCriteria[] = 'documents';
        }

        // Check sector-based eligibility
        $sectorCheck = $this->checkSectorEligibility($beneficiary, $program);
        if (! $sectorCheck['eligible']) {
            if (! empty($sectorCheck['reasons'])) {
                $reasons = array_merge($reasons, $sectorCheck['reasons']);
            }
            // Sector eligibility is not a hard requirement, so we don't add to failedCriteria
            // but we note it in the remarks
        }

        // Determine eligibility
        $isEligible = empty($failedCriteria);
        $determination = $isEligible ? 'eligible' : 'not_eligible';

        // If some criteria failed but not critical ones, mark as conditional
        $criticalCriteria = ['income', 'residency'];
        $criticalFailures = array_intersect($failedCriteria, $criticalCriteria);
        if (! $isEligible && empty($criticalFailures)) {
            $determination = 'conditional';
        }

        $remarks = $this->generateRemarks($reasons, $passedCriteria, $failedCriteria);

        return new EligibilityResult(
            isEligible: $isEligible,
            determination: $determination,
            reasons: $reasons,
            failedCriteria: $failedCriteria,
            passedCriteria: $passedCriteria,
            remarks: $remarks
        );
    }

    /**
     * Calculate total household income.
     */
    protected function calculateHouseholdIncome($beneficiary): float
    {
        $beneficiaryIncome = $beneficiary->monthly_income ?? 0;
        $householdIncome = $beneficiary->householdMembers()
            ->where('is_dependent', false)
            ->sum('monthly_income') ?? 0;

        return (float) ($beneficiaryIncome + $householdIncome);
    }

    /**
     * Check if required documents are present and verified.
     */
    protected function checkRequiredDocuments(BeneficiaryApplication $application, string $program): array
    {
        $requiredDocs = config("housing.required_documents.{$program}", []);
        $uploadedDocs = $application->documents()
            ->whereIn('document_type', $requiredDocs)
            ->pluck('document_type')
            ->toArray();

        $missing = [];
        foreach ($requiredDocs as $docType) {
            if (! in_array($docType, $uploadedDocs)) {
                $missing[] = "Missing required document: {$docType}";
            } else {
                // Check if document is verified
                $doc = $application->documents()
                    ->where('document_type', $docType)
                    ->where('verification_status', '!=', 'invalid')
                    ->first();

                if (! $doc || $doc->verification_status === 'invalid') {
                    $missing[] = "Document '{$docType}' is missing or invalid";
                }
            }
        }

        return [
            'complete' => empty($missing),
            'missing' => $missing,
        ];
    }

    /**
     * Generate remarks based on eligibility check results.
     */
    protected function generateRemarks(array $reasons, array $passedCriteria, array $failedCriteria): string
    {
        if (empty($failedCriteria)) {
            return 'Application meets all eligibility criteria for this housing program.';
        }

        $remarks = 'Eligibility check completed. ';
        $remarks .= count($passedCriteria).' criteria passed, '.count($failedCriteria).' criteria failed. ';

        if (count($reasons) > 0) {
            $remarks .= 'Issues: '.implode('; ', array_slice($reasons, 0, 3));
            if (count($reasons) > 3) {
                $remarks .= ' and '.(count($reasons) - 3).' more.';
            }
        }

        return $remarks;
    }

    /**
     * Check sector-based eligibility requirements.
     */
    protected function checkSectorEligibility($beneficiary, string $program): array
    {
        $sectors = $beneficiary->getSectors();
        $reasons = [];
        $eligible = true;

        // Check if beneficiary has required sectors for the program
        $requiredSectors = config("housing.eligibility_criteria.{$program}.required_sectors", []);

        if (! empty($requiredSectors)) {
            $hasRequiredSector = false;
            foreach ($requiredSectors as $requiredSector) {
                if ($beneficiary->hasSector(BeneficiarySector::from($requiredSector))) {
                    $hasRequiredSector = true;
                    break;
                }
            }

            if (! $hasRequiredSector) {
                $eligible = false;
                $reasons[] = 'Beneficiary does not belong to any required sector for this program';
            }
        }

        // Validate sector assignments
        $sectorService = app(BeneficiarySectorService::class);
        foreach ($sectors as $sector) {
            if (! $sectorService->validateSector($beneficiary, $sector)) {
                $reasons[] = "Sector '{$sector->label()}' validation failed - please verify supporting documents";
            }
        }

        return [
            'eligible' => $eligible,
            'reasons' => $reasons,
        ];
    }
}
