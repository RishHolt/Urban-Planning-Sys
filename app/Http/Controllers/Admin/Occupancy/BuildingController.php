<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BuildingController extends Controller
{
    /**
     * Display a listing of buildings.
     */
    public function index(Request $request): Response
    {
        $query = Building::withCount(['units', 'occupancyRecords', 'inspections', 'violations']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('building_code', 'like', "%{$search}%")
                    ->orWhere('building_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%");
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

        $buildings = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Occupancy/Buildings/BuildingsIndex', [
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'building_type', 'occupancy_status', 'structure_source']),
        ]);
    }

    /**
     * Show the form for creating a new building.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Occupancy/Buildings/BuildingForm');
    }

    /**
     * Store a newly created building.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_name' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'pin_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'pin_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'owner_contact' => ['nullable', 'string', 'max:50'],
            'building_type' => ['required', 'in:residential,commercial,industrial,mixed_use,institutional'],
            'structure_source' => ['required', 'in:sbr,housing,building_permit,manual'],
            'total_floors' => ['nullable', 'integer', 'min:1'],
            'total_units' => ['nullable', 'integer', 'min:0'],
            'total_floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'occupancy_status' => ['required', 'in:vacant,partially_occupied,fully_occupied,under_construction,condemned'],
            'certificate_of_occupancy_date' => ['nullable', 'date'],
            'sbr_reference_no' => ['nullable', 'string', 'max:30'],
            'building_permit_no' => ['nullable', 'string', 'max:30'],
            'housing_project_code' => ['nullable', 'string', 'max:30'],
        ]);

        // Generate building code
        $year = now()->year;
        $lastBuilding = Building::where('building_code', 'like', "BLD-{$year}-%")
            ->orderBy('building_code', 'desc')
            ->first();

        $sequence = 1;
        if ($lastBuilding) {
            $lastSequence = (int) Str::afterLast($lastBuilding->building_code, '-');
            $sequence = $lastSequence + 1;
        }

        $validated['building_code'] = sprintf('BLD-%d-%05d', $year, $sequence);
        $validated['registered_at'] = now();

        Building::create($validated);

        return redirect()->route('admin.occupancy.buildings.index')
            ->with('success', 'Building registered successfully.');
    }

    /**
     * Display the specified building.
     */
    public function show(Building $building): Response
    {
        $building->load([
            'units',
            'occupancyRecords.occupants',
            'inspections.inspector',
            'violations',
            'complaints',
        ]);

        return Inertia::render('Admin/Occupancy/Buildings/BuildingShow', [
            'building' => $building,
        ]);
    }

    /**
     * Show the form for editing the specified building.
     */
    public function edit(Building $building): Response
    {
        return Inertia::render('Admin/Occupancy/Buildings/BuildingForm', [
            'building' => $building,
        ]);
    }

    /**
     * Update the specified building.
     */
    public function update(Request $request, Building $building): RedirectResponse
    {
        $validated = $request->validate([
            'building_name' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'pin_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'pin_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'owner_contact' => ['nullable', 'string', 'max:50'],
            'building_type' => ['required', 'in:residential,commercial,industrial,mixed_use,institutional'],
            'structure_source' => ['required', 'in:sbr,housing,building_permit,manual'],
            'total_floors' => ['nullable', 'integer', 'min:1'],
            'total_units' => ['nullable', 'integer', 'min:0'],
            'total_floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'occupancy_status' => ['required', 'in:vacant,partially_occupied,fully_occupied,under_construction,condemned'],
            'certificate_of_occupancy_date' => ['nullable', 'date'],
            'sbr_reference_no' => ['nullable', 'string', 'max:30'],
            'building_permit_no' => ['nullable', 'string', 'max:30'],
            'housing_project_code' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
        ]);

        $building->update($validated);

        return redirect()->route('admin.occupancy.buildings.show', $building)
            ->with('success', 'Building updated successfully.');
    }

    /**
     * Remove the specified building.
     */
    public function destroy(Building $building): RedirectResponse
    {
        $building->delete();

        return redirect()->route('admin.occupancy.buildings.index')
            ->with('success', 'Building deleted successfully.');
    }

    /**
     * Register building from Housing module.
     */
    public function registerFromHousing(Request $request): RedirectResponse
    {
        // TODO: Implement integration with Housing module
        return redirect()->back()->with('error', 'Feature not yet implemented.');
    }

    /**
     * Register building from SBR module.
     */
    public function registerFromSbr(Request $request): RedirectResponse
    {
        // TODO: Implement integration with SBR module
        return redirect()->back()->with('error', 'Feature not yet implemented.');
    }
}
