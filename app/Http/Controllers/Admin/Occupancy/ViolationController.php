<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyInspection;
use App\Models\Violation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ViolationController extends Controller
{
    /**
     * Display a listing of violations.
     */
    public function index(Request $request): Response
    {
        $query = Violation::with(['building', 'unit', 'issuedBy', 'inspection']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('violation_no', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('building', function ($q) use ($search) {
                        $q->where('building_code', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by violation type
        if ($request->has('violation_type') && $request->violation_type) {
            $query->where('violation_type', $request->violation_type);
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity) {
            $query->where('severity', $request->severity);
        }

        // Filter open violations
        if ($request->has('open') && $request->open) {
            $query->whereIn('status', ['open', 'under_review']);
        }

        $violations = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Occupancy/Violations/ViolationsIndex', [
            'violations' => $violations,
            'filters' => $request->only(['search', 'status', 'violation_type', 'severity', 'open']),
        ]);
    }

    /**
     * Show the form for creating a new violation.
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

        $inspections = [];
        if ($request->has('building_id')) {
            $inspections = OccupancyInspection::where('building_id', $request->building_id)
                ->whereNotNull('inspection_date')
                ->latest()
                ->get(['id', 'scheduled_date', 'inspection_date', 'result']);
        }

        return Inertia::render('Admin/Occupancy/Violations/ViolationForm', [
            'buildings' => $buildings,
            'units' => $units,
            'inspections' => $inspections,
            'building_id' => $request->get('building_id'),
            'unit_id' => $request->get('unit_id'),
            'inspection_id' => $request->get('inspection_id'),
        ]);
    }

    /**
     * Store a newly created violation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_id' => ['required', 'exists:BUILDINGS,id'],
            'unit_id' => ['nullable', 'exists:BUILDING_UNITS,id'],
            'inspection_id' => ['nullable', 'exists:INSPECTIONS,id'],
            'violation_type' => ['required', 'in:unauthorized_use,overcrowding,structural_modification,fire_safety,sanitation,noise,parking,maintenance,documentation,other'],
            'description' => ['required', 'string'],
            'severity' => ['required', 'in:minor,major,critical'],
            'violation_date' => ['required', 'date'],
            'compliance_deadline' => ['nullable', 'date', 'after:violation_date'],
            'fine_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Generate violation number
        $year = now()->year;
        $lastViolation = Violation::where('violation_no', 'like', "VIO-{$year}-%")
            ->orderBy('violation_no', 'desc')
            ->first();

        $sequence = 1;
        if ($lastViolation) {
            $lastSequence = (int) Str::afterLast($lastViolation->violation_no, '-');
            $sequence = $lastSequence + 1;
        }

        $validated['violation_no'] = sprintf('VIO-%d-%05d', $year, $sequence);
        $validated['issued_by'] = $request->user()->id;

        Violation::create($validated);

        return redirect()->route('admin.occupancy.violations.index')
            ->with('success', 'Violation issued successfully.');
    }

    /**
     * Display the specified violation.
     */
    public function show(Violation $violation): Response
    {
        $violation->load([
            'building',
            'unit',
            'inspection',
            'issuedBy',
            'resolvedBy',
        ]);

        return Inertia::render('Admin/Occupancy/Violations/ViolationShow', [
            'violation' => $violation,
        ]);
    }

    /**
     * Resolve violation.
     */
    public function resolve(Request $request, Violation $violation): RedirectResponse
    {
        $validated = $request->validate([
            'resolution' => ['required', 'string'],
            'resolved_date' => ['required', 'date'],
        ]);

        $violation->update([
            'resolution' => $validated['resolution'],
            'resolved_date' => $validated['resolved_date'],
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
        ]);

        return redirect()->route('admin.occupancy.violations.show', $violation)
            ->with('success', 'Violation resolved successfully.');
    }
}
