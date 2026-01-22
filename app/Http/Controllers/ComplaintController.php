<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreComplaintRequest;
use App\Models\Allocation;
use App\Models\Complaint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    /**
     * Display a listing of complaints.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Complaint::class);

        $query = Complaint::with(['beneficiary', 'allocation', 'unit']);

        // Citizens can only see their own complaints
        if (auth()->user()->role === 'citizen') {
            $query->whereHas('beneficiary', function ($q) {
                $q->where('citizen_id', auth()->id());
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $complaints = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($complaint) {
                return [
                    'id' => (string) $complaint->id,
                    'complaint_no' => $complaint->complaint_no,
                    'beneficiary' => $complaint->beneficiary->full_name,
                    'unit_no' => $complaint->unit->unit_no,
                    'complaint_type' => $complaint->complaint_type,
                    'priority' => $complaint->priority,
                    'status' => $complaint->status,
                    'submitted_at' => $complaint->submitted_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Housing/ComplaintsIndex', [
            'complaints' => $complaints,
        ]);
    }

    /**
     * Store a newly created complaint.
     */
    public function store(StoreComplaintRequest $request): RedirectResponse
    {
        $this->authorize('create', Complaint::class);

        $allocation = Allocation::findOrFail($request->allocation_id);

        Complaint::create([
            'allocation_id' => $allocation->id,
            'beneficiary_id' => $allocation->beneficiary_id,
            'unit_id' => $allocation->unit_id,
            'complaint_type' => $request->complaint_type,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Complaint submitted successfully.');
    }

    /**
     * Update complaint status.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $complaint = Complaint::findOrFail($id);

        $this->authorize('update', $complaint);

        $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved,closed'],
            'resolution' => ['nullable', 'required_if:status,resolved', 'string', 'max:2000'],
        ]);

        $complaint->update([
            'status' => $request->status,
            'resolution' => $request->resolution,
            'resolved_by' => $request->status === 'resolved' ? auth()->id() : null,
            'resolved_at' => $request->status === 'resolved' ? now() : null,
        ]);

        return redirect()->back()->with('success', 'Complaint status updated successfully.');
    }

    /**
     * Assign complaint to staff.
     */
    public function assign(Request $request, string $id): RedirectResponse
    {
        $complaint = Complaint::findOrFail($id);

        $this->authorize('update', $complaint);

        $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $complaint->update([
            'assigned_to' => $request->assigned_to,
            'status' => 'in_progress',
        ]);

        return redirect()->back()->with('success', 'Complaint assigned successfully.');
    }
}
