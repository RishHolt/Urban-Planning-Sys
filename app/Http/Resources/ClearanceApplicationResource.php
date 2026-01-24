<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClearanceApplicationResource extends JsonResource
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
            'reference_no' => $this->reference_no,
            'applicationNumber' => $this->reference_no, // Alias for backward compatibility if needed

            'status' => $this->status,
            'denial_reason' => $this->denial_reason,
            'assessed_fee' => $this->assessed_fee,
            'applicant_type' => $this->applicant_type,
            'contact_number' => $this->contact_number,
            'contact_email' => $this->contact_email,
            'tax_dec_ref_no' => $this->tax_dec_ref_no,
            'barangay_permit_ref_no' => $this->barangay_permit_ref_no,
            'pin_lat' => $this->pin_lat !== null ? (float) $this->pin_lat : null,
            'pin_lng' => $this->pin_lng !== null ? (float) $this->pin_lng : null,
            'lot_address' => $this->lot_address,
            'province' => $this->province,
            'municipality' => $this->municipality,
            'barangay' => $this->barangay,
            'street_name' => $this->street_name,
            'lot_owner' => $this->lot_owner,
            'lot_area_total' => $this->lot_area_total,
            'is_subdivision' => $this->is_subdivision,
            'subdivision_name' => $this->subdivision_name,
            'block_no' => $this->block_no,
            'lot_no' => $this->lot_no,
            'total_lots_planned' => $this->total_lots_planned,
            'has_subdivision_plan' => $this->has_subdivision_plan,
            'land_use_type' => $this->land_use_type,
            'project_type' => $this->project_type,
            'formatted_project_type' => str_replace('_', ' ', ucfirst($this->project_type)),
            'building_type' => $this->building_type,
            'project_description' => $this->project_description,
            'existing_structure' => $this->existing_structure,
            'number_of_storeys' => $this->number_of_storeys,
            'floor_area_sqm' => $this->floor_area_sqm,
            'purpose' => $this->purpose,
            'zoneName' => $this->whenLoaded('zone', fn() => $this->zone->name),
            'zone' => $this->whenLoaded('zone'),
            
            // Relationships
            'documents' => $this->whenLoaded('documents', fn() => $this->documents->map(fn ($doc) => [
                'id' => $doc->id,
                'file_name' => $doc->file_name,
                'file_path' => $doc->file_path,
                'file_type' => $doc->file_type,
                'file_size' => $doc->file_size,
                'uploaded_at' => $doc->uploaded_at?->format('Y-m-d H:i:s'),
            ])),
            
            'externalVerifications' => $this->whenLoaded('externalVerifications', fn() => $this->externalVerifications->map(fn ($v) => [
                'id' => $v->id,
                'verification_type' => $v->verification_type,
                'reference_no' => $v->reference_no,
                'status' => $v->status,
                'response_data' => $v->response_data,
                'external_system' => $v->external_system,
                'verified_at' => $v->verified_at?->format('Y-m-d H:i:s'),
            ])),
            
            'history' => $this->whenLoaded('history', fn() => $this->history->map(fn ($h) => [
                'id' => $h->id,
                'status' => $h->status,
                'remarks' => $h->remarks,
                'updated_by' => $h->updated_by,
                'updated_at' => $h->updated_at->format('Y-m-d H:i:s'),
            ])),

            'inspection' => $this->whenLoaded('inspection', fn() => [
                'id' => $this->inspection->id,
                'inspector_id' => $this->inspection->inspector_id,
                'scheduled_date' => $this->inspection->scheduled_date->format('Y-m-d'),
                'findings' => $this->inspection->findings,
                'result' => $this->inspection->result,
                'inspected_at' => $this->inspection->inspected_at?->format('Y-m-d H:i:s'),
            ]),

            'issuedClearance' => $this->whenLoaded('issuedClearance', fn() => [
                'id' => $this->issuedClearance->id,
                'clearance_no' => $this->issuedClearance->clearance_no,
                'issue_date' => $this->issuedClearance->issue_date->format('Y-m-d'),
                'valid_until' => $this->issuedClearance->valid_until?->format('Y-m-d'),
                'conditions' => $this->issuedClearance->conditions,
                'status' => $this->issuedClearance->status,
            ]),

            // Frontend Compatibility Aliases
            'applicantName' => $this->lot_owner,
            'companyName' => null,
            'submittedAt' => $this->submitted_at?->format('Y-m-d H:i:s'),
            'createdAt' => $this->created_at->format('Y-m-d H:i:s'),
            'projectType' => str_replace('_', ' ', ucfirst($this->project_type)),
            
            'submitted_at' => $this->submitted_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
