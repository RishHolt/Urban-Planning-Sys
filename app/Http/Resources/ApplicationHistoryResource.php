<?php

namespace App\Http\Resources;

use App\Models\User;
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
            'status' => $this->status ?? 'N/A',
            'eventType' => $this->event_type ?? 'status_change',
            'remarks' => $this->remarks ?? 'No remarks provided.',
            'metadata' => $this->metadata,
            'performerName' => $this->resolvePerformerName(),
            'updatedBy' => $this->updated_by,
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
        ];
    }

    private function resolvePerformerName(): string
    {
        /** @var User|null $user */
        $user = $this->updatedBy;

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
