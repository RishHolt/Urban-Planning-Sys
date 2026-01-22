<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\OccupancyComplaint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OccupancyComplaintController extends Controller
{
    /**
     * Display a listing of complaints.
     */
    public function index(Request $request): Response
    {
        $query = OccupancyComplaint::with(['building', 'unit', 'assignedTo', 'inspection']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('complaint_no', 'like', "%{$search}%")
                    ->orWhere('complainant_name', 'like', "%{$search}%")
                    ->orWhereHas('building', function ($q) use ($search) {
                        $q->where('building_code', 'like', "%{$search}%")
                            ->orWhere('building_name', 'like', "%{$search}%");
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

        $complaints = $query->orderBy('submitted_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($complaint) {
                return [
                    'id' => (string) $complaint->id,
                    'complaint_no' => $complaint->complaint_no,
                    'complainant_name' => $complaint->complainant_name,
                    'complaint_type' => $complaint->complaint_type,
                    'priority' => $complaint->priority,
                    'status' => $complaint->status,
                    'building' => $complaint->building ? [
                        'id' => (string) $complaint->building->id,
                        'building_code' => $complaint->building->building_code,
                        'building_name' => $complaint->building->building_name,
                    ] : null,
                    'unit' => $complaint->unit ? [
                        'id' => (string) $complaint->unit->id,
                        'unit_no' => $complaint->unit->unit_no,
                    ] : null,
                    'submitted_at' => $complaint->submitted_at?->format('Y-m-d H:i:s'),
                    'resolved_at' => $complaint->resolved_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Occupancy/ComplaintsIndex', [
            'complaints' => $complaints,
            'filters' => $request->only(['search', 'status', 'priority', 'complaint_type']),
        ]);
    }

    /**
     * Display the specified complaint.
     */
    public function show(string $id): Response
    {
        $complaint = OccupancyComplaint::with([
            'building',
            'unit',
            'assignedTo',
            'resolvedBy',
            'inspection.photos',
        ])->findOrFail($id);

        return Inertia::render('Admin/Occupancy/ComplaintShow', [
            'complaint' => $complaint,
        ]);
    }
}
