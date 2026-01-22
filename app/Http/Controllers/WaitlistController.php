<?php

namespace App\Http\Controllers;

use App\Models\Waitlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaitlistController extends Controller
{
    /**
     * Display a listing of waitlist entries.
     */
    public function index(Request $request): Response
    {
        // Only staff and admin can view waitlist
        if (! in_array(auth()->user()->role, ['staff', 'admin'])) {
            abort(403);
        }

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

        return Inertia::render('Admin/Housing/WaitlistIndex', [
            'waitlist' => $waitlist,
        ]);
    }

    /**
     * Display the specified waitlist entry.
     */
    public function show(string $id): Response
    {
        $waitlist = Waitlist::with(['beneficiary', 'application'])->findOrFail($id);

        // Only staff and admin can view waitlist
        if (! in_array(auth()->user()->role, ['staff', 'admin'])) {
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
