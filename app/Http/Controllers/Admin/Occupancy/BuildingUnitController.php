<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingUnit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuildingUnitController extends Controller
{
    /**
     * Display a listing of building units.
     */
    public function index(Request $request): Response
    {
        $query = BuildingUnit::with(['building']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('unit_no', 'like', "%{$search}%")
                    ->orWhere('current_occupant_name', 'like', "%{$search}%")
                    ->orWhereHas('building', function ($q) use ($search) {
                        $q->where('building_name', 'like', "%{$search}%")
                            ->orWhere('building_code', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by building
        if ($request->has('building_id') && $request->building_id) {
            $query->where('building_id', $request->building_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by unit type
        if ($request->has('unit_type') && $request->unit_type) {
            $query->where('unit_type', $request->unit_type);
        }

        // Filter overcrowded units
        if ($request->has('overcrowded') && $request->overcrowded) {
            $query->whereRaw('current_occupant_count > max_occupants')
                ->whereNotNull('max_occupants');
        }

        $units = $query->latest()->paginate(15)->withQueryString();

        $buildings = Building::where('is_active', true)
            ->orderBy('building_name')
            ->get(['id', 'building_code', 'building_name']);

        return Inertia::render('Admin/Occupancy/Units/UnitsIndex', [
            'units' => $units,
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'building_id', 'status', 'unit_type', 'overcrowded']),
        ]);
    }

    /**
     * Get units by building.
     */
    public function byBuilding(Building $building): Response
    {
        $units = BuildingUnit::where('building_id', $building->id)
            ->with(['occupancyRecords.occupants'])
            ->get();

        return Inertia::render('Admin/Occupancy/Units/UnitsIndex', [
            'units' => $units,
            'building' => $building,
        ]);
    }

    /**
     * Show the form for creating a new unit.
     */
    public function create(Request $request): Response
    {
        $buildings = Building::where('is_active', true)
            ->orderBy('building_name')
            ->get(['id', 'building_code', 'building_name']);

        return Inertia::render('Admin/Occupancy/Units/UnitForm', [
            'buildings' => $buildings,
            'building_id' => $request->get('building_id'),
        ]);
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_id' => ['required', 'exists:BUILDINGS,id'],
            'unit_no' => ['required', 'string', 'max:20'],
            'floor_number' => ['nullable', 'integer', 'min:1'],
            'unit_type' => ['required', 'in:residential,commercial,office,warehouse,parking,storage'],
            'floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'max_occupants' => ['nullable', 'integer', 'min:1'],
            'current_occupant_count' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:vacant,occupied,reserved,under_renovation,maintenance'],
        ]);

        // Check unique unit_no within building
        $exists = BuildingUnit::where('building_id', $validated['building_id'])
            ->where('unit_no', $validated['unit_no'])
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withErrors(['unit_no' => 'Unit number already exists in this building.'])
                ->withInput();
        }

        BuildingUnit::create($validated);

        return redirect()->route('admin.occupancy.units.index')
            ->with('success', 'Unit created successfully.');
    }

    /**
     * Display the specified unit.
     */
    public function show(BuildingUnit $unit): Response
    {
        $unit->load([
            'building',
            'occupancyRecords.occupants',
            'inspections.inspector',
            'violations',
            'complaints',
        ]);

        return Inertia::render('Admin/Occupancy/Units/UnitShow', [
            'unit' => $unit,
        ]);
    }

    /**
     * Show the form for editing the specified unit.
     */
    public function edit(BuildingUnit $unit): Response
    {
        $buildings = Building::where('is_active', true)
            ->orderBy('building_name')
            ->get(['id', 'building_code', 'building_name']);

        return Inertia::render('Admin/Occupancy/Units/UnitForm', [
            'unit' => $unit,
            'buildings' => $buildings,
        ]);
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, BuildingUnit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'unit_no' => ['required', 'string', 'max:20'],
            'floor_number' => ['nullable', 'integer', 'min:1'],
            'unit_type' => ['required', 'in:residential,commercial,office,warehouse,parking,storage'],
            'floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'max_occupants' => ['nullable', 'integer', 'min:1'],
            'current_occupant_count' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:vacant,occupied,reserved,under_renovation,maintenance'],
            'current_occupant_name' => ['nullable', 'string', 'max:150'],
            'occupancy_start_date' => ['nullable', 'date'],
        ]);

        // Check unique unit_no within building (excluding current unit)
        $exists = BuildingUnit::where('building_id', $unit->building_id)
            ->where('unit_no', $validated['unit_no'])
            ->where('id', '!=', $unit->id)
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withErrors(['unit_no' => 'Unit number already exists in this building.'])
                ->withInput();
        }

        $unit->update($validated);

        return redirect()->route('admin.occupancy.units.show', $unit)
            ->with('success', 'Unit updated successfully.');
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(BuildingUnit $unit): RedirectResponse
    {
        $unit->delete();

        return redirect()->route('admin.occupancy.units.index')
            ->with('success', 'Unit deleted successfully.');
    }
}
