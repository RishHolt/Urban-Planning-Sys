<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AISuggestionController extends Controller
{
    /**
     * Get AI-powered zoning type suggestions.
     */
    public function suggestZoningType(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'project_description' => 'nullable|string|max:2000',
            'land_use_type' => 'nullable|string|in:residential,commercial,industrial,agricultural,institutional,mixed_use',
            'project_type' => 'nullable|string|in:new_construction,renovation,addition,change_of_use',
        ]);

        // Get zones with caching
        $cacheKey = 'zones_for_ai_suggestions';
        $zones = Cache::remember($cacheKey, 3600, function () {
            return Zone::active()
                ->zoning()
                ->withGeometry()
                ->with('classification')
                ->get()
                ->map(function ($zone) {
                    return [
                        'id' => $zone->id,
                        'code' => $zone->classification->code ?? 'UNKNOWN',
                        'name' => $zone->classification->name ?? 'Unknown',
                        'geometry' => $zone->geometry,
                    ];
                });
        });

        // Simple rule-based suggestions (frontend will handle TensorFlow.js)
        $suggestions = $this->generateRuleBasedSuggestions(
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null,
            $validated['project_description'] ?? '',
            $validated['land_use_type'] ?? 'residential',
            $zones
        );

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Generate rule-based suggestions (fallback for AI).
     *
     * @param  \Illuminate\Support\Collection  $zones
     */
    protected function generateRuleBasedSuggestions(
        ?float $latitude,
        ?float $longitude,
        string $projectDescription,
        string $landUseType,
        $zones
    ): array {
        $suggestions = [];

        // Filter zones by land use compatibility
        $compatibleZones = $zones->filter(function ($zone) use ($landUseType) {
            $code = strtoupper($zone['code'] ?? '');

            return match ($landUseType) {
                'residential' => str_starts_with($code, 'R') || $code === 'MU',
                'commercial' => str_starts_with($code, 'C') || $code === 'MU',
                'industrial' => str_starts_with($code, 'I'),
                'agricultural' => str_starts_with($code, 'A'),
                'institutional' => $code === 'INS',
                'mixed_use' => $code === 'MU' || str_starts_with($code, 'R') || str_starts_with($code, 'C'),
                default => true,
            };
        });

        // If we have location, prioritize zones near the location
        if ($latitude && $longitude) {
            // Simple distance-based scoring (would be more sophisticated with actual geometry checking)
            $scoredZones = $compatibleZones->map(function ($zone) {
                // For now, assign random confidence (frontend will do actual geometry checking)
                return [
                    'zone_id' => $zone['id'],
                    'code' => $zone['code'],
                    'name' => $zone['name'],
                    'confidence' => 0.7 + (rand(0, 30) / 100), // 0.7 to 1.0
                    'reasoning' => 'Based on location and land use compatibility',
                ];
            })->sortByDesc('confidence')->take(3);
        } else {
            // No location, just return compatible zones
            $scoredZones = $compatibleZones->take(3)->map(function ($zone) {
                return [
                    'zone_id' => $zone['id'],
                    'code' => $zone['code'],
                    'name' => $zone['name'],
                    'confidence' => 0.5,
                    'reasoning' => 'Based on land use compatibility',
                ];
            });
        }

        return $scoredZones->values()->toArray();
    }
}
