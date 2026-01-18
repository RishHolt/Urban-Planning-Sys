<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClupRequest;
use App\Http\Requests\StoreZoningClassificationRequest;
use App\Http\Requests\StoreZoningGisPolygonRequest;
use App\Http\Requests\UpdateClupRequest;
use App\Models\ClupMaster;
use App\Models\ZoningClassification;
use App\Models\ZoningGisPolygon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClupController extends Controller
{
    /**
     * Display a listing of CLUP records.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $query = ClupMaster::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lgu_name', 'like', "%{$search}%")
                    ->orWhere('resolution_no', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by year range
        if ($request->has('yearFrom') && $request->yearFrom) {
            $query->where('coverage_end_year', '>=', $request->yearFrom);
        }
        if ($request->has('yearTo') && $request->yearTo) {
            $query->where('coverage_start_year', '<=', $request->yearTo);
        }

        $clups = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($clup) {
                return [
                    'id' => (string) $clup->clup_id,
                    'referenceNo' => $clup->reference_no,
                    'lguName' => $clup->lgu_name,
                    'coverageStartYear' => $clup->coverage_start_year,
                    'coverageEndYear' => $clup->coverage_end_year,
                    'coveragePeriod' => "{$clup->coverage_start_year} - {$clup->coverage_end_year}",
                    'approvalDate' => $clup->approval_date?->format('Y-m-d'),
                    'approvingBody' => $clup->approving_body,
                    'resolutionNo' => $clup->resolution_no,
                    'status' => $clup->status,
                    'createdAt' => $clup->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        // Return JSON if it's an AJAX request (not Inertia)
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($clups);
        }

        return Inertia::render('Admin/Zoning/ClupIndex', [
            'clups' => $clups,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'yearFrom' => $request->yearFrom,
                'yearTo' => $request->yearTo,
            ],
        ]);
    }

    /**
     * Show the form for creating a new CLUP.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Zoning/ClupCreate');
    }

    /**
     * Store a newly created CLUP.
     */
    public function store(StoreClupRequest $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $validated = $request->validated();

        // Generate reference number
        $year = date('Y');
        $lastClup = ClupMaster::whereYear('created_at', $year)->orderBy('clup_id', 'desc')->first();
        $sequence = $lastClup ? ((int) substr($lastClup->reference_no, -4)) + 1 : 1;
        $referenceNo = sprintf('CLP-%s-%04d', $year, $sequence);

        $clup = ClupMaster::create([
            'lgu_name' => $validated['lgu_name'],
            'reference_no' => $referenceNo,
            'coverage_start_year' => $validated['coverage_start_year'],
            'coverage_end_year' => $validated['coverage_end_year'],
            'approval_date' => $validated['approval_date'] ?? null,
            'approving_body' => $validated['approving_body'] ?? null,
            'resolution_no' => $validated['resolution_no'] ?? null,
            'status' => $validated['status'] ?? 'Active',
        ]);

        // Return JSON if it's an AJAX request (for step-by-step creation)
        // Only return JSON if it's NOT an Inertia request
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'clup' => [
                    'id' => (string) $clup->clup_id,
                    'lguName' => $clup->lgu_name,
                ],
            ]);
        }

        return redirect()->route('admin.zoning.clup.index')
            ->with('success', 'CLUP created successfully.');
    }

    /**
     * Display the specified CLUP.
     */
    public function show(string $id): Response
    {
        $clup = ClupMaster::with(['zoningClassifications.gisPolygons'])
            ->findOrFail($id);

        $classifications = $clup->zoningClassifications->map(function ($classification) {
            return [
                'id' => (string) $classification->zoning_id,
                'zoningCode' => $classification->zoning_code,
                'zoneName' => $classification->zone_name,
                'landUseCategory' => $classification->land_use_category,
                'allowedUses' => $classification->allowed_uses,
                'conditionalUses' => $classification->conditional_uses,
                'prohibitedUses' => $classification->prohibited_uses,
                'polygonCount' => $classification->gisPolygons->count(),
            ];
        });

        return Inertia::render('Admin/Zoning/ClupShow', [
            'clup' => [
                'id' => (string) $clup->clup_id,
                'referenceNo' => $clup->reference_no,
                'lguName' => $clup->lgu_name,
                'coverageStartYear' => $clup->coverage_start_year,
                'coverageEndYear' => $clup->coverage_end_year,
                'coveragePeriod' => "{$clup->coverage_start_year} - {$clup->coverage_end_year}",
                'approvalDate' => $clup->approval_date?->format('Y-m-d'),
                'approvingBody' => $clup->approving_body,
                'resolutionNo' => $clup->resolution_no,
                'status' => $clup->status,
                'createdAt' => $clup->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $clup->updated_at?->format('Y-m-d H:i:s'),
            ],
            'classifications' => $classifications,
        ]);
    }

    /**
     * Show the form for editing the specified CLUP.
     */
    public function edit(string $id): Response
    {
        $clup = ClupMaster::findOrFail($id);

        return Inertia::render('Admin/Zoning/ClupEdit', [
            'clup' => [
                'id' => (string) $clup->clup_id,
                'referenceNo' => $clup->reference_no,
                'lguName' => $clup->lgu_name,
                'coverageStartYear' => $clup->coverage_start_year,
                'coverageEndYear' => $clup->coverage_end_year,
                'approvalDate' => $clup->approval_date?->format('Y-m-d'),
                'approvingBody' => $clup->approving_body,
                'resolutionNo' => $clup->resolution_no,
                'status' => $clup->status,
            ],
        ]);
    }

    /**
     * Update the specified CLUP.
     */
    public function update(UpdateClupRequest $request, string $id): RedirectResponse
    {
        $clup = ClupMaster::findOrFail($id);
        $validated = $request->validated();

        $clup->update([
            'lgu_name' => $validated['lgu_name'],
            'coverage_start_year' => $validated['coverage_start_year'],
            'coverage_end_year' => $validated['coverage_end_year'],
            'approval_date' => $validated['approval_date'],
            'approving_body' => $validated['approving_body'] ?? null,
            'resolution_no' => $validated['resolution_no'] ?? null,
            'status' => $validated['status'],
        ]);

        return redirect()->route('admin.zoning.clup.show', $id)
            ->with('success', 'CLUP updated successfully.');
    }

    /**
     * Remove the specified CLUP.
     */
    public function destroy(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $clup = ClupMaster::findOrFail($id);
        $clup->delete();

        // Return JSON if it's an AJAX request (not Inertia)
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        // Return redirect for Inertia requests
        return redirect()->route('admin.zoning.clup.index')
            ->with('success', 'CLUP deleted successfully.');
    }

    /**
     * Get zoning classifications for a CLUP.
     */
    public function getClassifications(string $clupId): JsonResponse
    {
        $clup = ClupMaster::findOrFail($clupId);
        $classifications = $clup->zoningClassifications->map(function ($classification) {
            return [
                'id' => (string) $classification->zoning_id,
                'zoningCode' => $classification->zoning_code,
                'zoneName' => $classification->zone_name,
                'landUseCategory' => $classification->land_use_category,
                'allowedUses' => $classification->allowed_uses,
                'conditionalUses' => $classification->conditional_uses,
                'prohibitedUses' => $classification->prohibited_uses,
            ];
        });

        return response()->json($classifications);
    }

    /**
     * Store a newly created zoning classification.
     */
    public function storeClassification(StoreZoningClassificationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $classification = ZoningClassification::create([
            'clup_id' => $validated['clup_id'],
            'zoning_code' => $validated['zoning_code'],
            'zone_name' => $validated['zone_name'],
            'land_use_category' => $validated['land_use_category'] ?? null,
            'allowed_uses' => $validated['allowed_uses'] ?? null,
            'conditional_uses' => $validated['conditional_uses'] ?? null,
            'prohibited_uses' => $validated['prohibited_uses'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->zoning_id,
                'zoningCode' => $classification->zoning_code,
                'zoneName' => $classification->zone_name,
                'landUseCategory' => $classification->land_use_category,
                'allowedUses' => $classification->allowed_uses,
                'conditionalUses' => $classification->conditional_uses,
                'prohibitedUses' => $classification->prohibited_uses,
            ],
        ]);
    }

    /**
     * Update the specified zoning classification.
     */
    public function updateClassification(StoreZoningClassificationRequest $request, string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);
        $validated = $request->validated();

        $classification->update([
            'zoning_code' => $validated['zoning_code'],
            'zone_name' => $validated['zone_name'],
            'land_use_category' => $validated['land_use_category'] ?? null,
            'allowed_uses' => $validated['allowed_uses'] ?? null,
            'conditional_uses' => $validated['conditional_uses'] ?? null,
            'prohibited_uses' => $validated['prohibited_uses'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->zoning_id,
                'zoningCode' => $classification->zoning_code,
                'zoneName' => $classification->zone_name,
                'landUseCategory' => $classification->land_use_category,
                'allowedUses' => $classification->allowed_uses,
                'conditionalUses' => $classification->conditional_uses,
                'prohibitedUses' => $classification->prohibited_uses,
            ],
        ]);
    }

    /**
     * Remove the specified zoning classification.
     */
    public function destroyClassification(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $classification = ZoningClassification::findOrFail($id);
        $classification->delete();

        // Return JSON if it's an AJAX request (not Inertia)
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        // Return redirect for Inertia requests
        return redirect()->back()->with('success', 'Classification deleted successfully.');
    }

    /**
     * Get GIS polygons for a zoning classification.
     */
    public function getPolygons(string $zoningId): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($zoningId);
        $polygons = $classification->gisPolygons->map(function ($polygon) {
            return [
                'id' => (string) $polygon->polygon_id,
                'barangay' => $polygon->barangay,
                'areaSqm' => $polygon->area_sqm,
                'geometry' => $polygon->geometry,
            ];
        });

        return response()->json($polygons);
    }

    /**
     * Get all polygons for a CLUP with classification info
     */
    public function getAllPolygonsForClup(string $clupId): JsonResponse
    {
        $clup = ClupMaster::findOrFail($clupId);
        $classifications = $clup->zoningClassifications;

        $allPolygons = collect();
        foreach ($classifications as $classification) {
            foreach ($classification->gisPolygons as $polygon) {
                $allPolygons->push([
                    'id' => (string) $polygon->polygon_id,
                    'barangay' => $polygon->barangay,
                    'areaSqm' => $polygon->area_sqm,
                    'geometry' => $polygon->geometry,
                    'zoningId' => (string) $classification->zoning_id,
                    'zoningCode' => $classification->zoning_code,
                    'zoneName' => $classification->zone_name,
                ]);
            }
        }

        return response()->json($allPolygons->values()->all());
    }

    /**
     * Store a newly created GIS polygon.
     */
    public function storePolygon(StoreZoningGisPolygonRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Model casts geometry as 'array', so Laravel will handle JSON encoding automatically
            $polygon = ZoningGisPolygon::create([
                'zoning_id' => $validated['zoning_id'],
                'barangay' => $validated['barangay'] ?? null,
                'area_sqm' => $validated['area_sqm'] ?? null,
                'geometry' => $validated['geometry'], // Already validated as array
            ]);

            return response()->json([
                'success' => true,
                'polygon' => [
                    'id' => (string) $polygon->polygon_id,
                    'barangay' => $polygon->barangay,
                    'areaSqm' => $polygon->area_sqm,
                    'geometry' => $polygon->geometry,
                    'zoningId' => (string) $polygon->zoning_id,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to save polygon', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to save polygon: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified GIS polygon.
     */
    public function updatePolygon(StoreZoningGisPolygonRequest $request, string $id): JsonResponse
    {
        try {
            $polygon = ZoningGisPolygon::findOrFail($id);
            $validated = $request->validated();

            // Model casts geometry as 'array', so Laravel will handle JSON encoding automatically
            $polygon->update([
                'barangay' => $validated['barangay'] ?? null,
                'area_sqm' => $validated['area_sqm'] ?? null,
                'geometry' => $validated['geometry'], // Already validated as array
            ]);

            return response()->json([
                'success' => true,
                'polygon' => [
                    'id' => (string) $polygon->polygon_id,
                    'barangay' => $polygon->barangay,
                    'areaSqm' => $polygon->area_sqm,
                    'geometry' => $polygon->geometry,
                    'zoningId' => (string) $polygon->zoning_id,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to update polygon', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to update polygon: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified GIS polygon.
     */
    public function destroyPolygon(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $polygon = ZoningGisPolygon::findOrFail($id);
        $polygon->delete();

        // Return JSON if it's an AJAX request (not Inertia)
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        // Return redirect for Inertia requests
        return redirect()->back()->with('success', 'Polygon deleted successfully.');
    }
}
