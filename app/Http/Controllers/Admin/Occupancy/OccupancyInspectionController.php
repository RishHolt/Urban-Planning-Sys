<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyComplaint;
use App\Models\OccupancyInspection;
use App\Models\OccupancyInspectionPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OccupancyInspectionController extends Controller
{
    /**
     * Display a listing of inspections.
     */
    public function index(Request $request): Response
    {
        $query = OccupancyInspection::with(['building', 'unit', 'inspector', 'complaint']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('building', function ($q) use ($search) {
                    $q->where('building_code', 'like', "%{$search}%")
                        ->orWhere('building_name', 'like', "%{$search}%");
                })
                    ->orWhereHas('unit', function ($q) use ($search) {
                        $q->where('unit_no', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by inspection type
        if ($request->has('inspection_type') && $request->inspection_type) {
            $query->where('inspection_type', $request->inspection_type);
        }

        // Filter by result
        if ($request->has('result') && $request->result) {
            $query->where('result', $request->result);
        }

        // Filter upcoming inspections
        if ($request->has('upcoming') && $request->upcoming) {
            $query->where('scheduled_date', '>=', now())
                ->whereNull('inspection_date');
        }

        $inspections = $query->latest('scheduled_date')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Occupancy/Inspections/InspectionsIndex', [
            'inspections' => $inspections,
            'filters' => $request->only(['search', 'inspection_type', 'result', 'upcoming']),
        ]);
    }

    /**
     * Show the form for creating a new inspection.
     */
    public function create(Request $request): Response
    {
        $buildings = Building::where('is_active', true)
            ->orderBy('building_name')
            ->get(['id', 'building_code', 'building_name']);

        $units = [];
        if ($request->has('building_id')) {
            $units = BuildingUnit::where('building_id', $request->building_id)
                ->orderBy('unit_no')
                ->get(['id', 'unit_no']);
        }

        $complaints = OccupancyComplaint::where('status', 'open')
            ->orWhere('status', 'assigned')
            ->get(['id', 'complaint_no', 'complaint_type', 'description']);

        return Inertia::render('Admin/Occupancy/Inspections/InspectionForm', [
            'buildings' => $buildings,
            'units' => $units,
            'complaints' => $complaints,
            'building_id' => $request->get('building_id'),
            'unit_id' => $request->get('unit_id'),
            'complaint_id' => $request->get('complaint_id'),
        ]);
    }

    /**
     * Store a newly created inspection.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_id' => ['required', 'exists:BUILDINGS,id'],
            'unit_id' => ['nullable', 'exists:BUILDING_UNITS,id'],
            'inspection_type' => ['required', 'in:annual,periodic,pre_occupancy,complaint_based,follow_up,random'],
            'inspector_id' => ['required', 'exists:users,id'],
            'complaint_id' => ['nullable', 'exists:COMPLAINTS,id'],
            'scheduled_date' => ['required', 'date'],
            'next_inspection_date' => ['nullable', 'date', 'after:scheduled_date'],
        ]);

        OccupancyInspection::create($validated);

        return redirect()->route('admin.occupancy.inspections.index')
            ->with('success', 'Inspection scheduled successfully.');
    }

    /**
     * Display the specified inspection.
     */
    public function show(OccupancyInspection $inspection): Response
    {
        $inspection->load([
            'building',
            'unit',
            'inspector',
            'complaint',
            'photos.takenBy',
            'violations',
        ]);

        return Inertia::render('Admin/Occupancy/Inspections/InspectionShow', [
            'inspection' => $inspection,
        ]);
    }

    /**
     * Complete an inspection.
     */
    public function complete(Request $request, OccupancyInspection $inspection): RedirectResponse
    {
        $validated = $request->validate([
            'inspection_date' => ['required', 'date'],
            'findings' => ['nullable', 'string'],
            'compliance_notes' => ['nullable', 'string'],
            'result' => ['required', 'in:compliant,non_compliant,conditional,pending_correction'],
            'recommendations' => ['nullable', 'string'],
            'next_inspection_date' => ['nullable', 'date', 'after:inspection_date'],
        ]);

        $validated['inspected_at'] = now();

        $inspection->update($validated);

        // Update building/unit last inspection date
        if ($inspection->building_id) {
            $inspection->building->update(['last_inspection_date' => $validated['inspection_date']]);
        }
        if ($inspection->unit_id) {
            $inspection->unit->update(['last_inspection_date' => $validated['inspection_date']]);
        }

        return redirect()->route('admin.occupancy.inspections.show', $inspection)
            ->with('success', 'Inspection completed successfully.');
    }

    /**
     * Upload photo for inspection.
     */
    public function uploadPhoto(Request $request, OccupancyInspection $inspection): RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:10240'], // 10MB max
            'photo_description' => ['nullable', 'string', 'max:255'],
        ]);

        $path = $request->file('photo')->store('inspections', 'public');

        OccupancyInspectionPhoto::create([
            'inspection_id' => $inspection->id,
            'photo_path' => $path,
            'photo_description' => $validated['photo_description'] ?? null,
            'taken_at' => now(),
            'taken_by' => $request->user()->id,
        ]);

        return redirect()->back()
            ->with('success', 'Photo uploaded successfully.');
    }
}
