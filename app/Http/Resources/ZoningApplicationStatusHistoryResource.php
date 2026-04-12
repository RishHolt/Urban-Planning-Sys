<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ZoningApplicationStatusHistoryResource extends JsonResource
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
            'zoningApplicationId' => $this->zoning_application_id,
            'statusFrom' => $this->status_from,
            'statusTo' => $this->status_to,
            'remarks' => $this->notes,
            'changedBy' => $this->changed_by,
            'performerName' => $this->resolvePerformerName(),
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function resolvePerformerName(): string
    {
        /** @var User|null $user */
        $user = $this->changedBy;

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
