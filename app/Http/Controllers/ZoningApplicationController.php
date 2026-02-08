<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreZoningApplicationRequest;
use App\Http\Resources\ZoningApplicationResource;
use App\Models\ZoningApplication;
use App\Services\ZoningApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ZoningApplicationController extends Controller
{
    public function __construct(
        protected ZoningApplicationService $zoningApplicationService,
        protected \App\Services\FeeAssessmentService $feeAssessmentService
    ) {}

    /**
     * Display a listing of the user's clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = ZoningApplication::with(['zone'])
            ->where('user_id', Auth::id());

        // Filter by status if provided
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(10);

        // Manually transform collection while keeping pagination structure
        $applications->getCollection()->transform(function ($application) {
            return (new ZoningApplicationResource($application))->resolve();
        });

        return Inertia::render('Applications/ApplicationsIndex', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show the zoning application form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', ZoningApplication::class);

        return Inertia::render('Applications/ZoningApplication');
    }

    /**
     * Store a newly created zoning application.
     */
    public function store(StoreZoningApplicationRequest $request): RedirectResponse
    {
        $application = $this->zoningApplicationService->createApplication($request->validated());

        return redirect()->route('zoning-applications.index')
            ->with('success', 'Application submitted successfully. Reference Number: '.$application->reference_no);
    }

    /**
     * Display the specified zoning application.
     */
    public function show(string $id): Response
    {
        $application = ZoningApplication::with([
            'zone',
            'documents.versions',
            'history',
            'externalVerifications',
            'inspection',
            'issuedClearance',
        ])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('view', $application);

        return Inertia::render('Applications/ZoningApplicationDetails', [
            'application' => (new ZoningApplicationResource($application))->resolve(),
        ]);
    }

    /**
     * Assess fees for a potential application.
     */
    public function assessFees(Request $request): \Illuminate\Http\JsonResponse
    {
        // Only validate fields necessary for fee calculation
        $validated = $request->validate([
            'zone_id' => 'nullable|exists:zones,id',
            'is_subdivision' => 'boolean',
            'total_lots_planned' => 'nullable|integer',
            'floor_area_sqm' => 'nullable|numeric',
            'project_type' => 'nullable|string',
        ]);

        $assessment = $this->feeAssessmentService->calculateZoningFee($validated);

        return response()->json($assessment);
    }
}
