<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ZoningApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'applicationNumber' => $this->application_number,
            'userId' => $this->user_id,
            'serviceId' => $this->service_id,
            'status' => $this->status,
            'submittedAt' => $this->submitted_at?->format('Y-m-d H:i:s'),
            'projectType' => $this->proposed_use, // Frontend compatibility


            // Applicant Information
            'applicantType' => $this->applicant_type,
            'applicantName' => $this->applicant_name,
            'applicantEmail' => $this->applicant_email,
            'applicantContact' => $this->applicant_contact,
            'validIdPath' => $this->valid_id_path,

            // Company Information
            'companyName' => $this->company_name,
            'secDtiRegNo' => $this->sec_dti_reg_no,
            'authorizedRepresentative' => $this->authorized_representative,

            // Property Owner Information
            'isPropertyOwner' => $this->is_property_owner,
            'ownerName' => $this->owner_name,
            'ownerAddress' => $this->owner_address,
            'ownerContact' => $this->owner_contact,

            // Location Details
            'province' => $this->province,
            'municipality' => $this->municipality,
            'barangay' => $this->barangay,
            'lotNo' => $this->lot_no,
            'blockNo' => $this->block_no,
            'streetName' => $this->street_name,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,

            // Land Information
            'landType' => $this->land_type,
            'hasExistingStructure' => $this->has_existing_structure,
            'numberOfBuildings' => $this->number_of_buildings,
            'lotArea' => $this->lot_area,

            // Application Details
            'applicationType' => $this->application_type,
            'proposedUse' => $this->proposed_use,
            'projectDescription' => $this->project_description,
            'previousUse' => $this->previous_use,
            'justification' => $this->justification,

            // Legal Declarations
            'declarationTruthfulness' => $this->declaration_truthfulness,
            'agreementCompliance' => $this->agreement_compliance,
            'dataPrivacyConsent' => $this->data_privacy_consent,
            'applicationDate' => $this->application_date?->format('Y-m-d'),

            // Processing Information
            'notes' => $this->notes,
            'rejectionReason' => $this->rejection_reason,
            'reviewedBy' => $this->reviewed_by,
            'reviewedAt' => $this->reviewed_at?->format('Y-m-d H:i:s'),
            'approvedBy' => $this->approved_by,
            'approvedAt' => $this->approved_at?->format('Y-m-d H:i:s'),

            // Frontend Compatibility Data Map
            'data' => [
                'applicant_name' => $this->applicant_name,
                'company_name' => $this->company_name,
                'sec_dti_reg_no' => $this->sec_dti_reg_no,
                'authorized_representative' => $this->authorized_representative,
                'applicant_email' => $this->applicant_email,
                'applicant_contact' => $this->applicant_contact,
                'valid_id_path' => $this->valid_id_path,
                'valid_id_path_url' => $this->valid_id_path ? url('storage/' . $this->valid_id_path) : null,
                'owner_name' => $this->owner_name,
                'owner_contact' => $this->owner_contact,
                'owner_address' => $this->owner_address,
                'province' => $this->province,
                'municipality' => $this->municipality,
                'barangay' => $this->barangay,
                'street_name' => $this->street_name,
                'lot_no' => $this->lot_no,
                'block_no' => $this->block_no,
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'lot_area' => $this->lot_area,
                'has_existing_structure' => $this->has_existing_structure,
                'number_of_buildings' => $this->number_of_buildings,
                'project_description' => $this->project_description,
                'previous_use' => $this->previous_use,
                'justification' => $this->justification,
            ],

            // Relationships
            'documents' => $this->whenLoaded('documents', fn() => $this->documents->map(fn ($doc) => [
                'id' => $doc->id,
                'documentType' => $doc->document_type,
                'type' => $doc->type,
                'manualId' => $doc->manual_id,
                'fileName' => $doc->file_name,
                'filePath' => $doc->file_path,
                'fileSize' => $doc->file_size,
                'mimeType' => $doc->mime_type,
                'status' => $doc->status,
                'reviewedBy' => $doc->reviewed_by,
                'reviewedAt' => $doc->reviewed_at?->format('Y-m-d H:i:s'),
                'notes' => $doc->notes,
                'version' => $doc->version,
                'isCurrent' => $doc->is_current,
                'createdAt' => $doc->created_at?->format('Y-m-d H:i:s'),
            ])),

            'statusHistory' => $this->whenLoaded('statusHistory', fn() => $this->statusHistory->map(fn ($h) => [
                'id' => $h->id,
                'statusFrom' => $h->status_from,
                'statusTo' => $h->status_to,
                'changedBy' => $h->changed_by,
                'notes' => $h->notes,
                'createdAt' => $h->created_at?->format('Y-m-d H:i:s'),
            ])),

            // Timestamps
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
