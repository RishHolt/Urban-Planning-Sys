<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

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
            'tctNo' => $this->tct_no,
            'lotOwnerContactNumber' => $this->lot_owner_contact_number,
            'lotOwnerContactEmail' => $this->lot_owner_contact_email,

            // Land Information
            'lotAreaTotal' => $this->lot_area_total,
            'lotAreaUsed' => $this->lot_area_used,
            'isSubdivision' => (bool) $this->is_subdivision,
            'subdivisionName' => $this->subdivision_name,
            'blockNo' => $this->block_no,
            'lotNo' => $this->lot_no,
            'totalLotsPlanned' => $this->total_lots_planned,
            'hasSubdivisionPlan' => (bool) $this->has_subdivision_plan,

            // Project Details
            'landUseType' => $this->land_use_type,
            'projectType' => $this->project_type,
            'buildingType' => $this->building_type,
            'projectDescription' => $this->project_description,
            'numberOfStoreys' => $this->number_of_storeys,
            'floorAreaSqm' => $this->floor_area_sqm,
            'buildingFootprintSqm' => $this->building_footprint_sqm,
            'frontSetbackM' => $this->front_setback_m,
            'rearSetbackM' => $this->rear_setback_m,
            'sideSetbackLeftM' => $this->side_setback_left_m,
            'sideSetbackRightM' => $this->side_setback_right_m,
            'numberOfUnits' => $this->number_of_units,
            'purpose' => $this->purpose,
            'projectCost' => $this->project_cost,

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
            'documents' => $this->whenLoaded('documents', function () {
                return DocumentResource::collection($this->documents)->resolve();
            }),
            'history' => $this->whenLoaded('history', function () {
                return ApplicationHistoryResource::collection($this->history)->resolve();
            }),
            'externalVerifications' => $this->whenLoaded('externalVerifications', function () {
                return ExternalVerificationResource::collection($this->externalVerifications)->resolve();
            }),
            'inspection' => $this->whenLoaded('inspection'),
            'issuedClearance' => $this->whenLoaded('issuedClearance'),
            'statusHistory' => $this->whenLoaded('statusHistory', function () {
                return ZoningApplicationStatusHistoryResource::collection($this->statusHistory)->resolve();
            }),
            'timeline' => $this->buildTimeline(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function buildTimeline(): array
    {
        /** @var Collection<int, array<string, mixed>> $items */
        $items = collect();

        if ($this->relationLoaded('history')) {
            foreach ($this->history as $record) {
                $items->push([
                    'id' => 'ah-'.$record->id,
                    'status' => $record->status ?? 'N/A',
                    'eventType' => $record->event_type ?? 'status_change',
                    'remarks' => $record->remarks ?? 'No remarks provided.',
                    'metadata' => $record->metadata,
                    'performerName' => $this->performerDisplayName($record->updatedBy),
                    'updatedBy' => $record->updated_by,
                    'updatedAt' => $record->updated_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
                ]);
            }
        }

        if ($this->relationLoaded('statusHistory')) {
            foreach ($this->statusHistory as $record) {
                $from = $record->status_from ?? '—';
                $to = $record->status_to ?? '—';
                $notes = $record->notes;
                $remarks = ($notes !== null && $notes !== '') ? $notes : "Status changed from {$from} to {$to}.";

                $items->push([
                    'id' => 'zsh-'.$record->id,
                    'status' => $to,
                    'eventType' => 'status_change',
                    'remarks' => $remarks,
                    'metadata' => [
                        'status_from' => $record->status_from,
                        'status_to' => $record->status_to,
                    ],
                    'performerName' => $this->performerDisplayName($record->changedBy),
                    'updatedBy' => $record->changed_by,
                    'updatedAt' => $record->created_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
                ]);
            }
        }

        return $items->sortByDesc(fn (array $item): string => $item['updatedAt'])->values()->all();
    }

    private function performerDisplayName(?User $user): string
    {
        if (! $user) {
            return 'System';
        }

        $profile = $user->profile;
        if ($profile) {
            $name = trim(implode(' ', array_filter([
                $profile->first_name,
                $profile->middle_name,
                $profile->last_name,
                $profile->suffix,
            ])));

            if ($name !== '') {
                return $name;
            }
        }

        return $user->email ?? 'System';
    }
}
