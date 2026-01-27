<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationHistoryResource extends JsonResource
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
            'status' => $this->status ?? $this->status_to ?? 'N/A',
            'statusFrom' => $this->status_from ?? null,
            'remarks' => $this->remarks ?? $this->notes ?? 'N/A',
            'updatedBy' => $this->updated_by ?? $this->changed_by,
            'updatedAt' => ($this->updated_at ?? $this->created_at)?->format('Y-m-d H:i:s'),
        ];
    }
}
