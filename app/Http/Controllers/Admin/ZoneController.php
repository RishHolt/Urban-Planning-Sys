<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoneRequest;
use App\Http\Requests\UpdateZoneRequest;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    /**
     * Display a listing of all zones.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $query = Zone::with('classification');

        // Search functionality - search through classification fields
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('classification', function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })->orWhere('label', 'like', "%{$search}%");
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'no_boundaries') {
                $query->whereNull('geometry');
            } elseif ($request->status === 'with_boundaries') {
                $query->withGeometry();
            }
        }

        // Helper to format zone data
        $formatZone = function ($zone) {
            $classification = $zone->classification;

            return [
                'id' => (string) $zone->id,
                'zoning_classification_id' => (string) $zone->zoning_classification_id,
                'label' => $zone->label,
                'code' => $classification?->code ?? '',
                'name' => $classification?->name ?? '',
                'description' => $classification?->description,
                'allowed_uses' => $classification?->allowed_uses,
                'color' => $classification?->color,
                'is_active' => $zone->is_active,
                'has_geometry' => $zone->geometry !== null,
                'geometry' => $zone->geometry,
                'created_at' => $zone->created_at->format('Y-m-d H:i:s'),
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ] : null,
            ];
        };

        // If this is an API request (AJAX), return JSON
        if ($request->wantsJson() || $request->ajax()) {
            $zones = $query->orderBy('id', 'desc')
                ->get()
                ->map($formatZone);

            return response()->json([
                'success' => true,
                'data' => $zones,
            ]);
        }

        // Otherwise, return Inertia response for page rendering
        $zones = $query->orderBy('id', 'desc')
            ->paginate(15)
            ->through($formatZone);

        return Inertia::render('Admin/Zoning/ZonesIndex', [
            'zones' => $zones,
        ]);
    }

    /**
     * Store a newly created zone.
     */
    public function store(StoreZoneRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $zone = Zone::with('classification')->create($validated);
        $zone->refresh();

        $classification = $zone->classification;

        return response()->json([
            'success' => true,
            'zone' => [
                'id' => (string) $zone->id,
                'zoning_classification_id' => (string) $zone->zoning_classification_id,
                'label' => $zone->label,
                'code' => $classification?->code ?? '',
                'name' => $classification?->name ?? '',
                'description' => $classification?->description,
                'allowed_uses' => $classification?->allowed_uses,
                'color' => $classification?->color,
                'is_active' => $zone->is_active,
                'has_geometry' => $zone->geometry !== null,
                'geometry' => $zone->geometry,
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ] : null,
            ],
        ], 201);
    }

    /**
     * Display the specified zone.
     */
    public function show(string $id): JsonResponse
    {
        $zone = Zone::with('classification')->findOrFail($id);
        $classification = $zone->classification;

        return response()->json([
            'success' => true,
            'zone' => [
                'id' => (string) $zone->id,
                'zoning_classification_id' => (string) $zone->zoning_classification_id,
                'label' => $zone->label,
                'code' => $classification?->code ?? '',
                'name' => $classification?->name ?? '',
                'description' => $classification?->description,
                'allowed_uses' => $classification?->allowed_uses,
                'color' => $classification?->color,
                'is_active' => $zone->is_active,
                'geometry' => $zone->geometry,
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ] : null,
            ],
        ]);
    }

    /**
     * Update the specified zone.
     */
    public function update(UpdateZoneRequest $request, string $id): JsonResponse
    {
        $zone = Zone::with('classification')->findOrFail($id);

        $validated = $request->validated();

        $zone->update($validated);
        $zone->refresh();

        $classification = $zone->classification;

        return response()->json([
            'success' => true,
            'zone' => [
                'id' => (string) $zone->id,
                'zoning_classification_id' => (string) $zone->zoning_classification_id,
                'label' => $zone->label,
                'code' => $classification?->code ?? '',
                'name' => $classification?->name ?? '',
                'description' => $classification?->description,
                'allowed_uses' => $classification?->allowed_uses,
                'color' => $classification?->color,
                'is_active' => $zone->is_active,
                'has_geometry' => $zone->geometry !== null,
                'geometry' => $zone->geometry,
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ] : null,
            ],
        ]);
    }

    /**
     * Remove the specified zone.
     */
    public function destroy(string $id): JsonResponse
    {
        $zone = Zone::findOrFail($id);
        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Zone deleted successfully',
        ]);
    }

    /**
     * Get all active zones with geometry for map rendering.
     */
    public function getAllZones(): JsonResponse
    {
        $zones = Zone::with('classification')
            ->active()
            ->withGeometry()
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($zone) {
                $classification = $zone->classification;

                return [
                    'id' => (string) $zone->id,
                    'zoning_classification_id' => (string) $zone->zoning_classification_id,
                    'label' => $zone->label,
                    'code' => $classification?->code ?? '',
                    'name' => $classification?->name ?? '',
                    'color' => $classification?->color,
                    'geometry' => $zone->geometry,
                    'is_municipality' => $zone->is_municipality,
                ];
            });

        return response()->json([
            'success' => true,
            'zones' => $zones,
        ]);
    }

    /**
     * Export all zones as a GeoJSON FeatureCollection.
     */
    public function exportGeoJson(): JsonResponse
    {
        $zones = Zone::with('classification')->active()->get();

        $features = $zones->map(function ($zone) {
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
        });

        $geoJson = [
            'type' => 'FeatureCollection',
            'features' => $features,
        ];

        return response()->json($geoJson)
            ->withHeaders([
                'Content-Disposition' => 'attachment; filename="zoning_map.geojson"',
                'Content-Type' => 'application/geo+json',
            ]);
    }

    /**
     * Import zones from a GeoJSON FeatureCollection.
     */
    public function importGeoJson(\App\Http\Requests\ImportZoneRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $geoJson = json_decode(file_get_contents($file->path()), true);

        if (!$geoJson || !isset($geoJson['type']) || $geoJson['type'] !== 'FeatureCollection') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid GeoJSON format. Must be a FeatureCollection.',
            ], 422);
        }

        $importedCount = 0;
        $updatedCount = 0;
        $errors = [];

        foreach ($geoJson['features'] as $index => $feature) {
            try {
                // Get classification code with fallbacks for robust importing
                $classificationCode = $feature['properties']['classification_code'] 
                    ?? $feature['properties']['ref'] 
                    ?? $feature['properties']['name'] 
                    ?? 'IMPORT';

                // Ensure it's not too long and is upper case for consistency
                $classificationCode = strtoupper(substr($classificationCode, 0, 10));

                // 1. Find or create classification
                $classification = \App\Models\ZoningClassification::updateOrCreate(
                    ['code' => $classificationCode],
                    [
                        'name' => $feature['properties']['classification_name'] 
                            ?? $feature['properties']['name'] 
                            ?? "Imported Zone {$classificationCode}",
                        'description' => $feature['properties']['classification_description'] 
                            ?? $feature['properties']['boundary'] 
                            ?? 'Imported from external source',
                        'allowed_uses' => $feature['properties']['allowed_uses'] ?? 'Various',
                        'color' => $feature['properties']['color'] ?? '#3b82f6',
                        'is_active' => true,
                    ]
                );

                // 2. Find or create zone
                $geometry = $feature['geometry'] ?? null;
                $label = $feature['properties']['label'] ?? null;

                // If we have an ID, try to update existing
                $existingZone = null;
                if (isset($feature['properties']['id'])) {
                    $existingZone = Zone::find($feature['properties']['id']);
                }

                if ($existingZone) {
                    $existingZone->update([
                        'zoning_classification_id' => $classification->id,
                        'label' => $label ?? $existingZone->label,
                        'geometry' => $geometry,
                        'is_active' => $feature['properties']['is_active'] ?? true,
                    ]);
                    $updatedCount++;
                } else {
                    Zone::create([
                        'zoning_classification_id' => $classification->id,
                        'label' => $label,
                        'geometry' => $geometry,
                        'is_active' => $feature['properties']['is_active'] ?? true,
                    ]);
                    $importedCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Feature {$index}: " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => count($errors) < count($geoJson['features']),
            'message' => "Import completed: {$importedCount} new, {$updatedCount} updated.",
            'errors' => $errors,
        ]);
    }

    /**
     * Import a municipality boundary from a GeoJSON FeatureCollection.
     */
    public function importMunicipality(\App\Http\Requests\ImportZoneRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $geoJson = json_decode(file_get_contents($file->path()), true);

        if (!$geoJson || !isset($geoJson['type']) || !isset($geoJson['features'][0])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid GeoJSON format. Must contain at least one feature.',
            ], 422);
        }

        $feature = $geoJson['features'][0];
        $geometry = $feature['geometry'] ?? null;

        if (!$geometry) {
            return response()->json([
                'success' => false,
                'message' => 'First feature must have a valid geometry.',
            ], 422);
        }

        // 1. Clear existing municipality
        Zone::where('is_municipality', true)->delete();

        // 2. Find or create a "Municipality Boundary" classification
        $classification = \App\Models\ZoningClassification::updateOrCreate(
            ['code' => 'BOUNDARY'],
            [
                'name' => 'Municipality Boundary',
                'description' => 'The administrative boundary of the municipality.',
                'allowed_uses' => 'Boundary',
                'color' => '#000000',
                'is_active' => true,
            ]
        );

        // 3. Create the municipality zone
        $zone = Zone::create([
            'zoning_classification_id' => $classification->id,
            'label' => $feature['properties']['name'] ?? 'Municipality Boundary',
            'geometry' => $geometry,
            'is_active' => true,
            'is_municipality' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Municipality boundary imported successfully.',
            'zone' => $zone,
        ]);
    }
}
