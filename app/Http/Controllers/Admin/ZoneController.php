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
                ];
            });

        return response()->json([
            'success' => true,
            'zones' => $zones,
        ]);
    }
}
