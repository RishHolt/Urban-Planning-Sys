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
            'referenceNo' => $this->reference_no,
            'userId' => $this->user_id,
            'serviceId' => $this->service_id,
            'status' => $this->status,
            'submittedAt' => $this->submitted_at?->format('Y-m-d H:i:s'),
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),

            // Applicant Information
            'applicantType' => $this->applicant_type,
            'isRepresentative' => (bool) $this->is_representative,
            'representativeName' => $this->representative_name,
            'applicantName' => $this->applicant_name,
            'applicantEmail' => $this->applicant_email,
            'applicantContact' => $this->applicant_contact,
            'contactNumber' => $this->contact_number,
            'contactEmail' => $this->contact_email,
            
            // Prerequisites
            'taxDecRefNo' => $this->tax_dec_ref_no,
            'barangayPermitRefNo' => $this->barangay_permit_ref_no,
            
            // Location
            'pinLat' => $this->pin_lat !== null ? (float) $this->pin_lat : null,
            'pinLng' => $this->pin_lng !== null ? (float) $this->pin_lng : null,
            'lotAddress' => $this->lot_address,
            'province' => $this->province,
            'municipality' => $this->municipality,
            'barangay' => $this->barangay,
            'streetName' => $this->street_name,
            'lotOwner' => $this->lot_owner,
            'lotOwnerContactNumber' => $this->lot_owner_contact_number,
            'lotOwnerContactEmail' => $this->lot_owner_contact_email,
            
            // Land Information
            'lotAreaTotal' => $this->lot_area_total,
            'lotAreaUsed' => $this->lot_area_used,
            'isSubdivision' => (bool)$this->is_subdivision,
            'subdivisionName' => $this->subdivision_name,
            'blockNo' => $this->block_no,
            'lotNo' => $this->lot_no,
            'totalLotsPlanned' => $this->total_lots_planned,
            'hasSubdivisionPlan' => (bool)$this->has_subdivision_plan,
            
            // Project Details
            'landUseType' => $this->land_use_type,
            'projectType' => $this->project_type,
            'buildingType' => $this->building_type,
            'projectDescription' => $this->project_description,
            'numberOfStoreys' => $this->number_of_storeys,
            'floorAreaSqm' => $this->floor_area_sqm,
            'numberOfUnits' => $this->number_of_units,
            'purpose' => $this->purpose,
            
            // Fees & Processing
            'assessedFee' => $this->assessed_fee,
            'notes' => $this->notes,
            'rejectionReason' => $this->rejection_reason,
            'reviewedBy' => $this->reviewed_by,
            'reviewedAt' => $this->reviewed_at?->format('Y-m-d H:i:s'),
            'approvedBy' => $this->approved_by,
            'approvedAt' => $this->approved_at?->format('Y-m-d H:i:s'),

            // Relationships
            'zone' => $this->whenLoaded('zone'),
            'documents' => $this->whenLoaded('documents', function() {
                return DocumentResource::collection($this->documents)->resolve();
            }),
            'history' => $this->whenLoaded('history', function() {
                return ApplicationHistoryResource::collection($this->history)->resolve();
            }),
            'externalVerifications' => $this->whenLoaded('externalVerifications', function() {
                return ExternalVerificationResource::collection($this->externalVerifications)->resolve();
            }),
            'inspection' => $this->whenLoaded('inspection'),
            'issuedClearance' => $this->whenLoaded('issuedClearance'),
            'statusHistory' => $this->whenLoaded('statusHistory', function() {
                return ApplicationHistoryResource::collection($this->statusHistory)->resolve();
            }),
        ];
    }
}
