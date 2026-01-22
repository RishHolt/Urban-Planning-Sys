<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInspectionRequest;
use App\Models\ApplicationHistory;
use App\Models\ClearanceApplication;
use App\Models\Inspection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InspectionController extends Controller
{
    /**
     * Display a listing of inspections for the inspector.
     */
    public function index(Request $request): Response
    {
        $inspections = Inspection::where('inspector_id', Auth::id())
            ->with('clearanceApplication')
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return Inertia::render('Inspections/InspectionsIndex', [
            'inspections' => $inspections,
        ]);
    }

    /**
     * Store a newly scheduled inspection.
     */
    public function store(StoreInspectionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $inspection = Inspection::create([
            'application_id' => $validated['application_id'],
            'inspector_id' => $validated['inspector_id'],
            'scheduled_date' => $validated['scheduled_date'],
            'result' => 'pending',
        ]);

        // Update application status
        $application = ClearanceApplication::findOrFail($validated['application_id']);
        $application->update(['status' => 'for_inspection']);

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => 'for_inspection',
            'remarks' => 'Inspection scheduled for '.$validated['scheduled_date'],
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Inspection scheduled successfully.');
    }

    /**
     * Update inspection findings and result.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $inspection = Inspection::findOrFail($id);

        $validated = $request->validate([
            'findings' => ['nullable', 'string'],
            'result' => ['required', 'in:passed,failed'],
        ]);

        $inspection->update([
            'findings' => $validated['findings'],
            'result' => $validated['result'],
            'inspected_at' => now(),
        ]);

        // Update application status based on result
        $application = $inspection->clearanceApplication;
        if ($validated['result'] === 'passed') {
            $application->update(['status' => 'approved']);
            $status = 'approved';
            $remarks = 'Inspection passed. Ready for clearance issuance.';
        } else {
            $application->update(['status' => 'denied']);
            $status = 'denied';
            $remarks = 'Inspection failed: '.($validated['findings'] ?? 'No findings provided');
        }

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => $status,
            'remarks' => $remarks,
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Inspection results recorded.');
    }
}
