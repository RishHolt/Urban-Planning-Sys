<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClearanceApplicationRequest;
use App\Http\Resources\ClearanceApplicationResource;
use App\Models\ClearanceApplication;
use App\Services\ClearanceApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceApplicationController extends Controller
{
    public function __construct(
        protected ClearanceApplicationService $clearanceApplicationService,
        protected \App\Services\FeeAssessmentService $feeAssessmentService
    ) {}

    /**
     * Display a listing of the user's clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = ClearanceApplication::with(['zone'])
            ->where('user_id', Auth::id());



        // Filter by status if provided
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $applications = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Applications/ApplicationsIndex', [
            'applications' => ClearanceApplicationResource::collection($applications),
        ]);
    }

    /**
     * Show the clearance application form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', ClearanceApplication::class);

        return Inertia::render('Applications/ClearanceApplication');
    }

    /**
     * Store a newly created clearance application.
     */
    public function store(StoreClearanceApplicationRequest $request): RedirectResponse
    {
        $application = $this->clearanceApplicationService->createApplication($request->validated());

        return redirect()->route('clearance-applications.index')
            ->with('success', 'Application submitted successfully. Reference Number: ' . $application->reference_no);
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
        ])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('view', $application);

        return Inertia::render('Applications/ClearanceApplicationDetails', [
            'application' => new ClearanceApplicationResource($application),
        ]);
    }

    /**
     * Assess fees for a potential application.
     */
    public function assessFees(Request $request): \Illuminate\Http\JsonResponse
    {
        // Only validate fields necessary for fee calculation
        $validated = $request->validate([
            'zone_id' => 'nullable|exists:zcs_db.zones,id',
            'is_subdivision' => 'boolean',
            'total_lots_planned' => 'nullable|integer',
            'floor_area_sqm' => 'nullable|numeric',
            'project_type' => 'nullable|string',
        ]);

        $assessment = $this->feeAssessmentService->calculateZoningFee($validated);

        return response()->json($assessment);
    }
}

