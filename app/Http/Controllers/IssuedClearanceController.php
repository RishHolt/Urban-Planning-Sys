<?php

namespace App\Http\Controllers;

use App\Http\Requests\IssueClearanceRequest;
use App\Models\ApplicationHistory;
use App\Models\ClearanceApplication;
use App\Models\IssuedClearance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class IssuedClearanceController extends Controller
{
    /**
     * Display a listing of all issued clearances.
     */
    public function index(Request $request): Response
    {
        $query = IssuedClearance::with(['clearanceApplication.zone']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('clearance_no', 'like', "%{$search}%")
                    ->orWhereHas('clearanceApplication', function ($q) use ($search) {
                        $q->where('reference_no', 'like', "%{$search}%")
                            ->orWhere('lot_owner', 'like', "%{$search}%")
                            ->orWhere('lot_address', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $clearances = $query->orderBy('issue_date', 'desc')
            ->paginate(15)
            ->through(function ($clearance) {
                return [
                    'id' => (string) $clearance->id,
                    'clearance_no' => $clearance->clearance_no,
                    'reference_no' => $clearance->clearanceApplication->reference_no,
                    'lot_owner' => $clearance->clearanceApplication->lot_owner,
                    'lot_address' => $clearance->clearanceApplication->lot_address,
                    'issue_date' => $clearance->issue_date->format('Y-m-d'),
                    'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                    'status' => $clearance->status,
                ];
            });

        return Inertia::render('Admin/Clearance/ClearancesIndex', [
            'clearances' => $clearances,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display the specified issued clearance.
     */
    public function show(string $id): Response
    {
        $clearance = IssuedClearance::with(['clearanceApplication.zone.classification'])
            ->findOrFail($id);

        return Inertia::render('Admin/Clearance/ClearanceDetails', [
            'clearance' => [
                'id' => $clearance->id,
                'clearance_no' => $clearance->clearance_no,
                'application_id' => $clearance->application_id,
                'issue_date' => $clearance->issue_date->format('Y-m-d'),
                'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                'conditions' => $clearance->conditions,
                'status' => $clearance->status,
                'created_at' => $clearance->created_at->format('Y-m-d H:i:s'),
                'clearanceApplication' => [
                    'id' => $clearance->clearanceApplication->id,
                    'reference_no' => $clearance->clearanceApplication->reference_no,
                    'application_category' => $clearance->clearanceApplication->application_category,
                    'lot_address' => $clearance->clearanceApplication->lot_address,
                    'lot_owner' => $clearance->clearanceApplication->lot_owner,
                    'zone' => $clearance->clearanceApplication->zone ? [
                        'name' => $clearance->clearanceApplication->zone->classification?->name ?? 'N/A',
                        'code' => $clearance->clearanceApplication->zone->classification?->code ?? 'N/A',
                    ] : null,
                ],
            ],
        ]);
    }

    /**
     * Show the issue clearance form.
     */
    public function create(Request $request): Response
    {
        $applicationId = $request->query('application_id');
        $application = ClearanceApplication::findOrFail($applicationId);

        return Inertia::render('Admin/Clearance/IssueClearance', [
            'application' => [
                'id' => $application->id,
                'reference_no' => $application->reference_no,
                'lot_address' => $application->lot_address,
                'lot_owner' => $application->lot_owner,
                'status' => $application->status,
            ],
        ]);
    }

    /**
     * Issue a clearance for an approved application.
     */
    public function store(IssueClearanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $application = ClearanceApplication::findOrFail($validated['application_id']);

        if ($application->status !== 'approved') {
            return back()->withErrors([
                'application_id' => 'Application must be approved before issuing clearance.',
            ]);
        }

        // Generate clearance number
        $clearanceNo = IssuedClearance::generateClearanceNo();

        // Create issued clearance
        $clearance = IssuedClearance::create([
            'clearance_no' => $clearanceNo,
            'application_id' => $application->id,
            'issued_by' => Auth::id(),
            'issue_date' => $validated['issue_date'],
            'valid_until' => $validated['valid_until'] ?? null,
            'conditions' => $validated['conditions'] ?? null,
            'status' => 'active',
        ]);

        // Update application
        $application->update([
            'processed_at' => now(),
        ]);

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => 'approved',
            'remarks' => 'Clearance issued. Clearance Number: '.$clearanceNo,
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return redirect()->route('clearances.show', $clearance->id)
            ->with('success', 'Clearance issued successfully. Clearance Number: '.$clearanceNo);
    }
}
