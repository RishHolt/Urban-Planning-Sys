<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyComplaint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OccupancyComplaintController extends Controller
{
    /**
     * Display a listing of complaints.
     */
    public function index(Request $request): Response
    {
        $query = OccupancyComplaint::with(['building', 'unit', 'assignedTo']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('complaint_no', 'like', "%{$search}%")
                    ->orWhere('complainant_name', 'like', "%{$search}%")
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

        // Filter by priority
        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        // Filter by complaint type
        if ($request->has('complaint_type') && $request->complaint_type) {
            $query->where('complaint_type', $request->complaint_type);
        }

        $complaints = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Occupancy/Complaints/ComplaintsIndex', [
            'complaints' => $complaints,
            'filters' => $request->only(['search', 'status', 'priority', 'complaint_type']),
        ]);
    }

    /**
     * Show the form for creating a new complaint.
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

        return Inertia::render('Admin/Occupancy/Complaints/ComplaintForm', [
            'buildings' => $buildings,
            'units' => $units,
            'building_id' => $request->get('building_id'),
            'unit_id' => $request->get('unit_id'),
        ]);
    }

    /**
     * Store a newly created complaint.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_id' => ['required', 'exists:BUILDINGS,id'],
            'unit_id' => ['nullable', 'exists:BUILDING_UNITS,id'],
            'complainant_name' => ['required', 'string', 'max:150'],
            'complainant_contact' => ['nullable', 'string', 'max:50'],
            'complaint_type' => ['required', 'in:noise,sanitation,unauthorized_use,overcrowding,fire_hazard,structural,parking,other'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
        ]);

        // Generate complaint number
        $year = now()->year;
        $lastComplaint = OccupancyComplaint::where('complaint_no', 'like', "CMP-{$year}-%")
            ->orderBy('complaint_no', 'desc')
            ->first();

        $sequence = 1;
        if ($lastComplaint) {
            $lastSequence = (int) Str::afterLast($lastComplaint->complaint_no, '-');
            $sequence = $lastSequence + 1;
        }

        $validated['complaint_no'] = sprintf('CMP-%d-%05d', $year, $sequence);
        $validated['submitted_at'] = now();

        OccupancyComplaint::create($validated);

        return redirect()->route('admin.occupancy.complaints.index')
            ->with('success', 'Complaint registered successfully.');
    }

    /**
     * Display the specified complaint.
     */
    public function show(OccupancyComplaint $complaint): Response
    {
        $complaint->load([
            'building',
            'unit',
            'assignedTo',
            'inspection',
            'resolvedBy',
        ]);

        return Inertia::render('Admin/Occupancy/Complaints/ComplaintShow', [
            'complaint' => $complaint,
        ]);
    }

    /**
     * Assign complaint to inspector.
     */
    public function assign(Request $request, OccupancyComplaint $complaint): RedirectResponse
    {
        $validated = $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $complaint->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'assigned',
        ]);

        return redirect()->route('admin.occupancy.complaints.show', $complaint)
            ->with('success', 'Complaint assigned successfully.');
    }

    /**
     * Resolve complaint.
     */
    public function resolve(Request $request, OccupancyComplaint $complaint): RedirectResponse
    {
        $validated = $request->validate([
            'resolution' => ['required', 'string'],
        ]);

        $complaint->update([
            'resolution' => $validated['resolution'],
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return redirect()->route('admin.occupancy.complaints.show', $complaint)
            ->with('success', 'Complaint resolved successfully.');
    }
}
