<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExternalVerificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'verificationType' => $this->verification_type,
            'referenceNo' => $this->reference_no,
            'status' => $this->status,
            'responseData' => $this->response_data,
            'externalSystem' => $this->external_system,
            'verifiedAt' => $this->verified_at?->format('Y-m-d H:i:s'),
        ];
    }
}
