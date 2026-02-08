<?php

namespace App\Http\Controllers;

use App\Models\Waitlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaitlistController extends Controller
{
    /**
     * Display a listing of waitlist entries and allocations (combined view).
     */
    public function index(Request $request): Response
    {
        // Only staff and admin can view waitlist
        if (! in_array(auth()->user()->role, ['staff', 'admin', 'super_admin'])) {
            abort(403);
        }

        $view = $request->get('view', 'waitlist'); // 'waitlist' or 'allocations'

        $waitlist = null;
        $allocations = null;

        // Load waitlist if on waitlist tab or if view is not specified
        if ($view === 'waitlist' || ! $request->has('view')) {
            $query = Waitlist::with(['beneficiary', 'application'])
                ->where('status', 'active');

            if ($request->has('housing_program')) {
                $query->where('housing_program', $request->housing_program);
            }

            $waitlist = $query->orderBy('queue_position', 'asc')
                ->paginate(15)
                ->through(function ($entry) {
                    return [
                        'id' => (string) $entry->id,
                        'beneficiary' => $entry->beneficiary->full_name,
                        'beneficiary_no' => $entry->beneficiary->beneficiary_no,
                        'application_no' => $entry->application->application_no,
                        'housing_program' => $entry->housing_program,
                        'priority_score' => $entry->priority_score,
                        'queue_position' => $entry->queue_position,
                        'waitlist_date' => $entry->waitlist_date->format('Y-m-d'),
                    ];
                });
        }

        // Load allocations if on allocations tab
        if ($view === 'allocations') {
            $query = \App\Models\Allocation::with(['beneficiary', 'application', 'unit']);

            if ($request->has('status')) {
                $query->where('allocation_status', $request->status);
            }

            $allocations = $query->orderBy('created_at', 'desc')
                ->paginate(15)
                ->through(function ($allocation) {
                    return [
                        'id' => (string) $allocation->id,
                        'allocation_no' => $allocation->allocation_no,
                        'beneficiary' => $allocation->beneficiary->full_name,
                        'unit_no' => $allocation->unit->unit_no,
                        'allocation_status' => $allocation->allocation_status,
                        'allocation_date' => $allocation->allocation_date->format('Y-m-d'),
                        'acceptance_deadline' => $allocation->acceptance_deadline->format('Y-m-d'),
                    ];
                });
        }

        return Inertia::render('Admin/Housing/WaitlistAllocations', [
            'waitlist' => $waitlist,
            'allocations' => $allocations,
            'filters' => $request->only(['view', 'housing_program', 'status']),
        ]);
    }

    /**
     * Display the specified waitlist entry.
     */
    public function show(string $id): Response
    {
        $waitlist = Waitlist::with(['beneficiary', 'application'])->findOrFail($id);

        // Only staff and admin can view waitlist
        if (! in_array(auth()->user()->role, ['staff', 'admin', 'super_admin'])) {
            abort(403);
        }

        return Inertia::render('Admin/Housing/WaitlistShow', [
            'waitlist' => [
                'id' => (string) $waitlist->id,
                'beneficiary' => $waitlist->beneficiary,
                'application' => $waitlist->application,
                'housing_program' => $waitlist->housing_program,
                'priority_score' => $waitlist->priority_score,
                'queue_position' => $waitlist->queue_position,
                'waitlist_date' => $waitlist->waitlist_date->format('Y-m-d'),
                'status' => $waitlist->status,
            ],
        ]);
    }
}
