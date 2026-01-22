<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\OccupancyInspection;
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

        // Search functionality
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

        // Filter by inspector
        if ($request->has('inspector_id') && $request->inspector_id) {
            $query->where('inspector_id', $request->inspector_id);
        }

        // Filter by date range
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->whereDate('scheduled_date', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->whereDate('scheduled_date', '<=', $request->dateTo);
        }

        $inspections = $query->orderBy('scheduled_date', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($inspection) {
                return [
                    'id' => (string) $inspection->id,
                    'building' => $inspection->building ? [
                        'id' => (string) $inspection->building->id,
                        'building_code' => $inspection->building->building_code,
                        'building_name' => $inspection->building->building_name,
                    ] : null,
                    'unit' => $inspection->unit ? [
                        'id' => (string) $inspection->unit->id,
                        'unit_no' => $inspection->unit->unit_no,
                    ] : null,
                    'inspection_type' => $inspection->inspection_type,
                    'result' => $inspection->result,
                    'scheduled_date' => $inspection->scheduled_date?->format('Y-m-d'),
                    'inspection_date' => $inspection->inspection_date?->format('Y-m-d'),
                    'inspected_at' => $inspection->inspected_at?->format('Y-m-d H:i:s'),
                    'created_at' => $inspection->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Occupancy/InspectionsIndex', [
            'inspections' => $inspections,
            'filters' => $request->only(['search', 'inspection_type', 'result', 'inspector_id', 'dateFrom', 'dateTo']),
        ]);
    }

    /**
     * Show the form for creating a new inspection.
     */
    public function create(Request $request): Response
    {
        $buildings = Building::where('is_active', true)
            ->orderBy('building_code')
            ->get(['id', 'building_code', 'building_name']);

        return Inertia::render('Admin/Occupancy/InspectionForm', [
            'buildings' => $buildings,
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
            'building_id' => ['required', 'exists:omt_db.BUILDINGS,id'],
            'unit_id' => ['nullable', 'exists:omt_db.BUILDING_UNITS,id'],
            'inspection_type' => ['required', 'in:annual,periodic,pre_occupancy,complaint_based,follow_up,random'],
            'inspector_id' => ['required', 'exists:user_db.users,id'],
            'complaint_id' => ['nullable', 'exists:omt_db.COMPLAINTS,id'],
            'scheduled_date' => ['required', 'date'],
            'findings' => ['nullable', 'string'],
            'compliance_notes' => ['nullable', 'string'],
            'result' => ['nullable', 'in:compliant,non_compliant,conditional,pending_correction'],
            'recommendations' => ['nullable', 'string'],
            'next_inspection_date' => ['nullable', 'date'],
        ]);

        $inspection = OccupancyInspection::create($validated);

        return redirect()->route('admin.occupancy.inspections.show', $inspection->id)
            ->with('success', 'Inspection scheduled successfully.');
    }

    /**
     * Display the specified inspection.
     */
    public function show(string $id): Response
    {
        $inspection = OccupancyInspection::with([
            'building',
            'unit',
            'inspector',
            'complaint',
            'photos.takenBy',
            'violations',
        ])->findOrFail($id);

        return Inertia::render('Admin/Occupancy/InspectionShow', [
            'inspection' => $inspection,
        ]);
    }

    /**
     * Update the specified inspection (complete inspection).
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $inspection = OccupancyInspection::findOrFail($id);

        $validated = $request->validate([
            'inspection_date' => ['required', 'date'],
            'findings' => ['nullable', 'string'],
            'compliance_notes' => ['nullable', 'string'],
            'result' => ['required', 'in:compliant,non_compliant,conditional,pending_correction'],
            'recommendations' => ['nullable', 'string'],
            'next_inspection_date' => ['nullable', 'date'],
        ]);

        $inspection->update(array_merge($validated, [
            'inspected_at' => now(),
        ]));

        // Update building/unit last inspection date
        if ($inspection->building) {
            $inspection->building->update(['last_inspection_date' => $inspection->inspection_date]);
        }
        if ($inspection->unit) {
            $inspection->unit->update(['last_inspection_date' => $inspection->inspection_date]);
        }

        return redirect()->route('admin.occupancy.inspections.show', $inspection->id)
            ->with('success', 'Inspection completed successfully.');
    }

    /**
     * Complete inspection with photos.
     */
    public function complete(Request $request, string $id): RedirectResponse
    {
        $inspection = OccupancyInspection::findOrFail($id);

        $validated = $request->validate([
            'inspection_date' => ['required', 'date'],
            'findings' => ['nullable', 'string'],
            'compliance_notes' => ['nullable', 'string'],
            'result' => ['required', 'in:compliant,non_compliant,conditional,pending_correction'],
            'recommendations' => ['nullable', 'string'],
            'next_inspection_date' => ['nullable', 'date'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['image', 'max:5120'], // 5MB max
        ]);

        $inspection->update(array_merge($validated, [
            'inspected_at' => now(),
        ]));

        // Handle photo uploads
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('inspections', 'public');
                $inspection->photos()->create([
                    'photo_path' => $path,
                    'taken_at' => now(),
                    'taken_by' => auth()->id(),
                ]);
            }
        }

        // Update building/unit last inspection date
        if ($inspection->building) {
            $inspection->building->update(['last_inspection_date' => $inspection->inspection_date]);
        }
        if ($inspection->unit) {
            $inspection->unit->update(['last_inspection_date' => $inspection->inspection_date]);
        }

        return redirect()->route('admin.occupancy.inspections.show', $inspection->id)
            ->with('success', 'Inspection completed successfully.');
    }
}
