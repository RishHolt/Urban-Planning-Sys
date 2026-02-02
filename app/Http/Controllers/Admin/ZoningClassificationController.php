<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportZoneRequest;
use App\Http\Requests\StoreBarangayBoundaryRequest;
use App\Http\Requests\StoreMunicipalBoundaryRequest;
use App\Http\Requests\StoreZoningClassificationRequest;
use App\Http\Requests\UpdateZoningClassificationRequest;
use App\Models\Zone;
use App\Models\ZoningClassification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoningClassificationController extends Controller
{
    /**
     * Display a listing of classifications (Inertia page).
     */
    public function indexPage(Request $request): Response
    {
        $query = ZoningClassification::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $classifications = $query->orderBy('code', 'asc')
            ->paginate(15)
            ->through(function ($classification) {
                return [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ];
            });

        // Load boundary data
        $municipalBoundary = Zone::with('classification')
            ->municipal()
            ->first();

        $barangayBoundaries = Zone::with('classification')
            ->barangay()
            ->orderBy('label', 'asc')
            ->get()
            ->map(function ($zone) {
                $classification = $zone->classification;

                return [
                    'id' => (string) $zone->id,
                    'label' => $zone->label,
                    'geometry' => $zone->geometry,
                    'is_active' => $zone->is_active,
                    'classification' => $classification ? [
                        'id' => (string) $classification->id,
                        'code' => $classification->code,
                        'name' => $classification->name,
                        'color' => $classification->color,
                    ] : null,
                ];
            });

        // Get zoning boundaries count per classification
        $zoningCounts = Zone::zoning()
            ->selectRaw('zoning_classification_id, COUNT(*) as count')
            ->groupBy('zoning_classification_id')
            ->pluck('count', 'zoning_classification_id')
            ->toArray();

        return Inertia::render('Admin/Zoning/ClassificationsIndex', [
            'classifications' => $classifications,
            'municipalBoundary' => $municipalBoundary ? [
                'id' => (string) $municipalBoundary->id,
                'label' => $municipalBoundary->label,
                'geometry' => $municipalBoundary->geometry,
                'is_active' => $municipalBoundary->is_active,
                'classification' => $municipalBoundary->classification ? [
                    'id' => (string) $municipalBoundary->classification->id,
                    'code' => $municipalBoundary->classification->code,
                    'name' => $municipalBoundary->classification->name,
                    'color' => $municipalBoundary->classification->color,
                ] : null,
            ] : null,
            'barangayBoundaries' => $barangayBoundaries,
            'zoningCounts' => $zoningCounts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Get all classifications (for dropdowns, etc.)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ZoningClassification::query();

        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $classifications = $query->orderBy('code', 'asc')
            ->get()
            ->map(function ($classification) {
                return [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $classifications,
        ]);
    }

    /**
     * Store a newly created classification.
     */
    public function store(StoreZoningClassificationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $classification = ZoningClassification::create($validated);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ],
        ], 201);
    }

    /**
     * Display the specified classification.
     */
    public function show(string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ],
        ]);
    }

    /**
     * Update the specified classification.
     */
    public function update(UpdateZoningClassificationRequest $request, string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);

        $validated = $request->validated();

        $classification->update($validated);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ],
        ]);
    }

    /**
     * Remove the specified classification.
     */
    public function destroy(string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);

        // Check if any zones use this classification
        if ($classification->zones()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete classification that has zones assigned to it.',
            ], 422);
        }

        $classification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Classification deleted successfully',
        ]);
    }

    /**
     * Get the current municipal boundary.
     */
    public function getMunicipalBoundary(): JsonResponse
    {
        $boundary = Zone::with('classification')
            ->municipal()
            ->first();

        if (! $boundary) {
            return response()->json([
                'success' => true,
                'boundary' => null,
            ]);
        }

        $classification = $boundary->classification;

        return response()->json([
            'success' => true,
            'boundary' => [
                'id' => (string) $boundary->id,
                'zoning_classification_id' => (string) $boundary->zoning_classification_id,
                'label' => $boundary->label,
                'code' => $classification?->code ?? '',
                'name' => $classification?->name ?? '',
                'description' => $classification?->description,
                'allowed_uses' => $classification?->allowed_uses,
                'color' => $classification?->color,
                'is_active' => $boundary->is_active,
                'has_geometry' => $boundary->geometry !== null,
                'geometry' => $boundary->geometry,
                'boundary_type' => $boundary->boundary_type ?? 'municipal',
                'created_at' => $boundary->created_at?->format('Y-m-d H:i:s'),
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'color' => $classification->color,
                ] : null,
            ],
        ]);
    }

    /**
     * Get all barangay boundaries.
     */
    public function getBarangayBoundaries(): JsonResponse
    {
        $boundaries = Zone::with('classification')
            ->barangay()
            ->orderBy('label', 'asc')
            ->get()
            ->map(function ($zone) {
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
                    'boundary_type' => $zone->boundary_type ?? 'barangay',
                    'created_at' => $zone->created_at?->format('Y-m-d H:i:s'),
                    'classification' => $classification ? [
                        'id' => (string) $classification->id,
                        'code' => $classification->code,
                        'name' => $classification->name,
                        'color' => $classification->color,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'boundaries' => $boundaries,
        ]);
    }

    /**
     * Store or update the municipal boundary.
     */
    public function storeMunicipalBoundary(StoreMunicipalBoundaryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Clear existing municipality
        Zone::municipal()->delete();

        // Find or create a "Municipality Boundary" classification
        $classification = ZoningClassification::updateOrCreate(
            ['code' => 'BOUNDARY'],
            [
                'name' => 'Municipality Boundary',
                'description' => 'The administrative boundary of the municipality.',
                'allowed_uses' => 'Boundary',
                'color' => '#000000',
                'is_active' => true,
            ]
        );

        // Create the municipality zone
        $zone = Zone::create([
            'zoning_classification_id' => $classification->id,
            'label' => $validated['label'] ?? $validated['name'] ?? 'Municipality Boundary',
            'geometry' => $validated['geometry'],
            'is_active' => true,
            'boundary_type' => 'municipal',
        ]);

        $zone->load('classification');
        $classification = $zone->classification;

        return response()->json([
            'success' => true,
            'message' => 'Municipal boundary saved successfully.',
            'boundary' => [
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
                'boundary_type' => $zone->boundary_type ?? 'municipal',
                'created_at' => $zone->created_at?->format('Y-m-d H:i:s'),
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'color' => $classification->color,
                ] : null,
            ],
        ], 201);
    }

    /**
     * Store or update a barangay boundary.
     */
    public function storeBarangayBoundary(StoreBarangayBoundaryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Find or create a "Barangay Boundary" classification
        $classification = ZoningClassification::updateOrCreate(
            ['code' => 'BARANGAY'],
            [
                'name' => 'Barangay Boundary',
                'description' => 'The administrative boundary of a barangay.',
                'allowed_uses' => 'Boundary',
                'color' => '#808080',
                'is_active' => true,
            ]
        );

        // Create or update the barangay zone
        $zone = Zone::updateOrCreate(
            [
                'label' => $validated['label'] ?? $validated['name'],
                'boundary_type' => 'barangay',
            ],
            [
                'zoning_classification_id' => $classification->id,
                'geometry' => $validated['geometry'],
                'is_active' => true,
            ]
        );

        $zone->load('classification');
        $classification = $zone->classification;

        return response()->json([
            'success' => true,
            'message' => 'Barangay boundary saved successfully.',
            'boundary' => [
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
                'boundary_type' => $zone->boundary_type ?? 'barangay',
                'created_at' => $zone->created_at?->format('Y-m-d H:i:s'),
                'classification' => $classification ? [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'color' => $classification->color,
                ] : null,
            ],
        ], 201);
    }

    /**
     * Delete a barangay boundary.
     */
    public function deleteBarangayBoundary(string $id): JsonResponse
    {
        $zone = Zone::barangay()->findOrFail($id);
        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Barangay boundary deleted successfully.',
        ]);
    }

    /**
     * Delete all barangay boundaries.
     */
    public function deleteAllBarangayBoundaries(): JsonResponse
    {
        $count = Zone::barangay()->count();
        Zone::barangay()->delete();

        return response()->json([
            'success' => true,
            'message' => "Successfully deleted {$count} barangay boundary(ies).",
        ]);
    }

    /**
     * Import multiple barangay boundaries from GeoJSON.
     */
    public function importBarangayBoundaries(ImportZoneRequest $request): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $file = $request->file('file');
        $geoJson = json_decode(file_get_contents($file->path()), true);

        if (! $geoJson || ! isset($geoJson['type']) || $geoJson['type'] !== 'FeatureCollection') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid GeoJSON format. Must be a FeatureCollection.',
            ], 422);
        }

        // Find or create a "Barangay Boundary" classification
        $classification = ZoningClassification::updateOrCreate(
            ['code' => 'BARANGAY'],
            [
                'name' => 'Barangay Boundary',
                'description' => 'The administrative boundary of a barangay.',
                'allowed_uses' => 'Boundary',
                'color' => '#808080',
                'is_active' => true,
            ]
        );

        $importedCount = 0;
        $updatedCount = 0;
        $errors = [];

        foreach ($geoJson['features'] as $index => $feature) {
            try {
                $geometry = $feature['geometry'] ?? null;
                $label = $feature['properties']['name']
                    ?? $feature['properties']['label']
                    ?? $feature['properties']['barangay_name']
                    ?? "Barangay {$index}";

                if (! $geometry) {
                    $errors[] = "Feature {$index}: Missing geometry";

                    continue;
                }

                // Update or create barangay boundary
                $zone = Zone::updateOrCreate(
                    [
                        'label' => $label,
                        'boundary_type' => 'barangay',
                    ],
                    [
                        'zoning_classification_id' => $classification->id,
                        'geometry' => $geometry,
                        'is_active' => true,
                    ]
                );

                if ($zone->wasRecentlyCreated) {
                    $importedCount++;
                } else {
                    $updatedCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Feature {$index}: ".$e->getMessage();
            }
        }

        if ($request->header('X-Inertia')) {
            return back()->with('success', "Import completed: {$importedCount} new, {$updatedCount} updated.");
        }

        return response()->json([
            'success' => count($errors) < count($geoJson['features']),
            'message' => "Import completed: {$importedCount} new, {$updatedCount} updated.",
            'errors' => $errors,
        ]);
    }
}
