<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApplicationHistory;
use App\Http\Resources\ClearanceApplicationResource;
use App\Models\ClearanceApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminClearanceApplicationController extends Controller
{
    public function __construct(
        protected \App\Services\ClearanceApplicationService $clearanceApplicationService
    ) {}

    /**
     * Display a listing of all clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = ClearanceApplication::with('zone');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                    ->orWhere('lot_owner', 'like', "%{$search}%")
                    ->orWhere('lot_address', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->byStatus($request->status);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        // Manually transform the collection to preserve pagination structure for frontend
        $applications->getCollection()->transform(function ($application) {
            return (new ClearanceApplicationResource($application))->resolve();
        });

        return Inertia::render('Admin/Clearance/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'category' => $request->category,
            ],
        ]);
    }

    /**
     * Display the specified clearance application.
     */
    public function show(string $id): Response
    {
        $application = ClearanceApplication::with([
            'zone',
            'documents',
            'history',
            'externalVerifications',
            'inspection',
            'issuedClearance',
        ])->findOrFail($id);

        return Inertia::render('Admin/Clearance/ApplicationDetails', [
            'application' => new ClearanceApplicationResource($application),
        ]);
    }

    /**
     * Update application status following workflow.
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,under_review,for_inspection,approved,denied'],
            'remarks' => ['nullable', 'string'],
            'denial_reason' => ['nullable', 'string', 'required_if:status,denied'],
        ]);

        $application = ClearanceApplication::findOrFail($id);

        try {
            $this->clearanceApplicationService->updateStatus(
                $application,
                $validated['status'],
                $validated['remarks'] ?? null,
                $validated['denial_reason'] ?? null,
                auth()->id()
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Application status updated successfully.');
    }

    /**
     * Request additional documents from applicant.
     */
    public function requestDocuments(Request $request, string $id)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'requested_document_types' => ['nullable', 'array'],
        ]);

        $application = ClearanceApplication::findOrFail($id);

        // Only allow document requests for pending or under_review applications
        if (! in_array($application->status, ['pending', 'under_review'])) {
            return back()->withErrors([
                'status' => 'Document requests can only be made for pending or under review applications.',
            ]);
        }

        // Set status back to pending if it was under_review (workflow: D3 -> B7)
        if ($application->status === 'under_review') {
            $application->update(['status' => 'pending']);
        }

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => 'pending',
            'remarks' => 'Additional documents requested: '.$validated['message'],
            'updated_by' => auth()->id(),
            'updated_at' => now(),
        ]);

        // TODO: Send notification to applicant

        return back()->with('success', 'Document request sent to applicant.');
    }
}

