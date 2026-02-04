<?php

namespace App\Helpers;

use App\Models\Zone;

class ZoneFormatter
{
    /**
     * Format a zone for API/JSON response.
     *
     * @return array<string, mixed>
     */
    public static function format(Zone $zone, bool $includeFullClassification = true): array
    {
        $classification = $zone->classification;

        $formatted = [
            'id' => (string) $zone->id,
            'zoning_classification_id' => (string) $zone->zoning_classification_id,
            'label' => $zone->label,
            'code' => $classification?->code ?? '',
            'name' => $classification?->name ?? '',
            'is_active' => $zone->is_active,
            'has_geometry' => $zone->geometry !== null,
            'geometry' => $zone->geometry,
            'boundary_type' => $zone->boundary_type ?? 'zoning',
        ];

        if ($includeFullClassification) {
            $formatted['description'] = $classification?->description;
            $formatted['allowed_uses'] = $classification?->allowed_uses;
            $formatted['color'] = $classification?->color;
            $formatted['created_at'] = $zone->created_at?->format('Y-m-d H:i:s');
            $formatted['classification'] = $classification ? [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ] : null;
        } else {
            $formatted['color'] = $classification?->color;
            $formatted['classification'] = $classification ? [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'color' => $classification->color,
            ] : null;
        }

        return $formatted;
    }

    /**
     * Format zones for GeoJSON export.
     *
     * @return array<string, mixed>
     */
    public static function formatForGeoJson(Zone $zone): array
    {
        $classification = $zone->classification;

        return [
            'type' => 'Feature',
            'geometry' => $zone->geometry,
            'properties' => [
                'id' => (string) $zone->id,
                'label' => $zone->label,
                'classification_code' => $classification?->code,
                'classification_name' => $classification?->name,
                'classification_description' => $classification?->description,
                'allowed_uses' => $classification?->allowed_uses,
                'color' => $classification?->color,
                'is_active' => $zone->is_active,
            ],
        ];
    }
}
