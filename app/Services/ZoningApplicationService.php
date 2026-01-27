<?php

namespace App\Services;

use App\Models\ApplicationHistory;
use App\Models\ZoningApplication;
use App\Models\ExternalVerification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ZoningApplicationService
{
    public function __construct(
        protected TreasuryService $treasuryService,
        protected PermitLicensingService $permitLicensingService,
        protected FeeAssessmentService $feeAssessmentService
    ) {}

    /**
     * Create a new clearance application.
     */
    public function createApplication(array $data): ZoningApplication
    {
        $referenceNo = null;
        $application = null;

        DB::connection('zcs_db')->transaction(function () use ($data, &$referenceNo, &$application) {
            // Generate reference number
            $referenceNo = ZoningApplication::generateReferenceNo();

            // Handle address formatting
            $lotAddress = $this->formatAddress($data);

            // Calculate fee to ensure integrity (server-side calculation)
            $feeAssessment = $this->feeAssessmentService->calculateZoningFee($data);
            $assessedFee = $feeAssessment['amount'];

            // Create application
            $application = ZoningApplication::create([
                'application_number' => $referenceNo, // Internal sequence
                'reference_no' => $referenceNo,      // External/Friendly ref
                'service_id' => 'zoning-clearance', // System service ID
                'user_id' => Auth::id(),
                'zone_id' => $data['zone_id'],
                'applicant_type' => $data['applicant_type'],
                'is_representative' => $data['is_representative'] ?? false,
                'representative_name' => $data['representative_name'] ?? null,
                'applicant_name' => $data['lot_owner'], 
                'applicant_email' => $data['contact_email'] ?? 'N/A',
                'applicant_contact' => $data['contact_number'],
                'contact_number' => $data['contact_number'],
                'contact_email' => $data['contact_email'] ?? null,
                'valid_id_path' => 'pending', 
                
                // Location Details
                'province' => $data['province'] ?? null,
                'municipality' => $data['municipality'] ?? null,
                'barangay' => $data['barangay'] ?? null,
                'street_name' => $data['street_name'] ?? null,
                'lot_address' => $lotAddress,
                'pin_lat' => $data['pin_lat'],
                'pin_lng' => $data['pin_lng'],
                
                // Land Details
                'land_use_type' => $data['land_use_type'], 
                'lot_area_total' => $data['lot_area_total'],
                'lot_area_used' => $data['lot_area_used'] ?? null,
                
                // Property Owner
                'lot_owner' => $data['lot_owner'],
                'lot_owner_contact_number' => $data['lot_owner_contact_number'] ?? null,
                'lot_owner_contact_email' => $data['lot_owner_contact_email'] ?? null,
                
                // Application Details
                'application_type' => 'zoning_clearance',
                'project_type' => $data['project_type'],
                'proposed_use' => $data['building_type'] ?? $data['land_use_type'],
                'building_type' => $data['building_type'] ?? null,
                'project_description' => $data['project_description'],
                'purpose' => $data['purpose'],
                
                // Prerequisites
                'tax_dec_ref_no' => $data['tax_dec_ref_no'],
                'barangay_permit_ref_no' => $data['barangay_permit_ref_no'],
                
                // Subdivision Info
                'is_subdivision' => $data['is_subdivision'],
                'subdivision_name' => $data['subdivision_name'] ?? null,
                'block_no' => $data['block_no'] ?? null,
                'lot_no' => $data['lot_no'] ?? null,
                'total_lots_planned' => $data['total_lots_planned'] ?? null,
                'has_subdivision_plan' => $data['has_subdivision_plan'] ?? false,
                
                // Building Details
                'number_of_storeys' => $data['number_of_storeys'] ?? null,
                'floor_area_sqm' => $data['floor_area_sqm'] ?? null,
                'number_of_units' => $data['number_of_units'] ?? null,
                
                // Legal & System
                'declaration_truthfulness' => true,
                'agreement_compliance' => true,
                'data_privacy_consent' => true,
                'application_date' => now(),
                'assessed_fee' => $assessedFee,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Run verifications
            $this->verifyPrerequisites($application, $data);

            // Create initial history record
            ApplicationHistory::create([
                'application_id' => $application->id,
                'status' => 'pending',
                'remarks' => 'Application submitted',
                'updated_by' => Auth::id(),
                'updated_at' => now(),
            ]);
        });

        // Ensure we return the application with necessary relations if needed,
        // though typically the caller might just redirect.
        return $application;
    }

    /**
     * Format the address from constituent parts.
     */
    protected function formatAddress(array $data): string
    {
        $lotAddress = $data['lot_address'];
        
        if (!empty($data['province']) || !empty($data['municipality']) || !empty($data['barangay']) || !empty($data['street_name'])) {
            $addressParts = array_filter([
                $data['street_name'] ?? null,
                $data['barangay'] ?? null,
                $data['municipality'] ?? null,
                $data['province'] ?? null,
            ]);

            if (!empty($addressParts)) {
                $structuredAddress = implode(', ', $addressParts);
                // Append to lot_address if it exists, otherwise use structured address
                $lotAddress = !empty($lotAddress) ? $lotAddress . ', ' . $structuredAddress : $structuredAddress;
            }
        }

        return $lotAddress;
    }

    /**
     * Verify prerequisites and log results.
     */
    protected function verifyPrerequisites(ZoningApplication $application, array $data): void
    {
        // Verify Tax Declaration
        $taxDecVerification = $this->treasuryService->verifyTaxDeclaration($data['tax_dec_ref_no']);
        ExternalVerification::create([
            'application_id' => $application->id,
            'verification_type' => 'tax_declaration',
            'reference_no' => $data['tax_dec_ref_no'],
            'status' => $taxDecVerification['verified'] ? 'verified' : 'failed',
            'response_data' => $taxDecVerification['data'],
            'external_system' => 'Treasury',
            'verified_at' => $taxDecVerification['verified'] ? now() : null,
        ]);

        // Verify Barangay Permit
        $barangayPermitVerification = $this->permitLicensingService->verifyBarangayPermit($data['barangay_permit_ref_no']);
        ExternalVerification::create([
            'application_id' => $application->id,
            'verification_type' => 'barangay_permit',
            'reference_no' => $data['barangay_permit_ref_no'],
            'status' => $barangayPermitVerification['verified'] ? 'verified' : 'failed',
            'response_data' => $barangayPermitVerification['data'],
            'external_system' => 'Permit & Licensing',
            'verified_at' => $barangayPermitVerification['verified'] ? now() : null,
        ]);
    }

    /**
     * Update application status with workflow validation.
     */
    public function updateStatus(ZoningApplication $application, string $newStatus, ?string $remarks, ?string $denialReason, int $updatedBy): void
    {
        $currentStatus = $application->status;

        // Validate status transition according to workflow
        $validTransitions = [
            'pending' => ['under_review', 'denied'],
            'under_review' => ['for_inspection', 'denied', 'pending'], // pending = request more documents
            'for_inspection' => ['approved', 'denied'],
            'approved' => [], // Final state
            'denied' => [], // Final state
        ];

        if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            throw new \InvalidArgumentException("Invalid status transition from '{$currentStatus}' to '{$newStatus}'.");
        }

        DB::connection('zcs_db')->transaction(function () use ($application, $newStatus, $denialReason, $remarks, $updatedBy, $currentStatus) {
            $application->update([
                'status' => $newStatus,
                'denial_reason' => $denialReason,
                'processed_at' => in_array($newStatus, ['approved', 'denied']) ? now() : null,
            ]);

            // Create history record
            ApplicationHistory::create([
                'application_id' => $application->id,
                'status' => $newStatus,
                'remarks' => $remarks ?? $this->getDefaultRemarks($currentStatus, $newStatus),
                'updated_by' => $updatedBy,
                'updated_at' => now(),
            ]);
        });
    }

    /**
     * Get default remarks for status transition.
     */
    protected function getDefaultRemarks(string $fromStatus, string $toStatus): string
    {
        $remarks = [
            'pending' => [
                'under_review' => 'Application moved to review',
                'denied' => 'Application denied',
            ],
            'under_review' => [
                'for_inspection' => 'Application approved for inspection',
                'denied' => 'Application denied during review',
                'pending' => 'Returned to applicant for additional documents',
            ],
            'for_inspection' => [
                'approved' => 'Application approved after inspection',
                'denied' => 'Application denied after inspection',
            ],
        ];

        return $remarks[$fromStatus][$toStatus] ?? 'Status updated';
    }
}
