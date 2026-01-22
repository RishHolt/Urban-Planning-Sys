<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBuildingRequest;
use App\Http\Requests\UpdateBuildingRequest;
use App\Models\Building;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuildingController extends Controller
{
    /**
     * Display a listing of buildings.
     */
    public function index(Request $request): Response
    {
        $query = Building::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('building_code', 'like', "%{$search}%")
                    ->orWhere('building_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('sbr_reference_no', 'like', "%{$search}%")
                    ->orWhere('building_permit_no', 'like', "%{$search}%");
            });
        }

        // Filter by building type
        if ($request->has('building_type') && $request->building_type) {
            $query->where('building_type', $request->building_type);
        }

        // Filter by occupancy status
        if ($request->has('occupancy_status') && $request->occupancy_status) {
            $query->where('occupancy_status', $request->occupancy_status);
        }

        // Filter by structure source
        if ($request->has('structure_source') && $request->structure_source) {
            $query->where('structure_source', $request->structure_source);
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $buildings = $query->withCount(['units', 'inspections', 'violations', 'complaints'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($building) {
                return [
                    'id' => (string) $building->id,
                    'building_code' => $building->building_code,
                    'building_name' => $building->building_name,
                    'address' => $building->address,
                    'building_type' => $building->building_type,
                    'occupancy_status' => $building->occupancy_status,
                    'structure_source' => $building->structure_source,
                    'total_units' => $building->total_units,
                    'units_count' => $building->units_count,
                    'inspections_count' => $building->inspections_count,
                    'violations_count' => $building->violations_count,
                    'complaints_count' => $building->complaints_count,
                    'is_active' => $building->is_active,
                    'next_inspection_date' => $building->next_inspection_date?->format('Y-m-d'),
                    'created_at' => $building->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Occupancy/BuildingsIndex', [
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'building_type', 'occupancy_status', 'structure_source', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new building.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Occupancy/BuildingForm');
    }

    /**
     * Store a newly created building.
     */
    public function store(StoreBuildingRequest $request): RedirectResponse
    {
        $building = Building::create(array_merge(
            $request->validated(),
            ['registered_at' => now()]
        ));

        return redirect()->route('admin.occupancy.buildings.show', $building->id)
            ->with('success', 'Building registered successfully.');
    }

    /**
     * Display the specified building.
     */
    public function show(string $id): Response
    {
        $building = Building::with([
            'units',
            'occupancyRecords.occupants',
            'inspections.photos',
            'violations',
            'complaints',
            'complianceReports',
        ])->findOrFail($id);

        return Inertia::render('Admin/Occupancy/BuildingShow', [
            'building' => $building,
        ]);
    }

    /**
     * Show the form for editing the specified building.
     */
    public function edit(string $id): Response
    {
        $building = Building::findOrFail($id);

        return Inertia::render('Admin/Occupancy/BuildingForm', [
            'building' => $building,
        ]);
    }

    /**
     * Update the specified building.
     */
    public function update(UpdateBuildingRequest $request, string $id): RedirectResponse
    {
        $building = Building::findOrFail($id);
        $building->update($request->validated());

        return redirect()->route('admin.occupancy.buildings.show', $building->id)
            ->with('success', 'Building updated successfully.');
    }

    /**
     * Remove the specified building.
     */
    public function destroy(string $id): RedirectResponse
    {
        $building = Building::findOrFail($id);
        $building->update(['is_active' => false]);

        return redirect()->route('admin.occupancy.buildings.index')
            ->with('success', 'Building deactivated successfully.');
    }

    /**
     * Get units for a building (API endpoint).
     */
    public function getUnits(string $id): \Illuminate\Http\JsonResponse
    {
        $building = Building::with('units')->findOrFail($id);

        return response()->json([
            'units' => $building->units->map(function ($unit) {
                return [
                    'id' => (string) $unit->id,
                    'unit_no' => $unit->unit_no,
                    'floor_number' => $unit->floor_number,
                    'unit_type' => $unit->unit_type,
                ];
            }),
        ]);
    }
}
