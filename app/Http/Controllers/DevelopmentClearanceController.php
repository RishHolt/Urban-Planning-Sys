<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDevelopmentClearanceRequest;
use App\Models\SbrApplicationHistory;
use App\Models\SubdivisionApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DevelopmentClearanceController extends Controller
{
    /**
     * Display a listing of the user's development clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = SubdivisionApplication::where('user_id', Auth::id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'referenceNo' => $application->reference_no,
                    'subdivisionName' => $application->subdivision_name,
                    'status' => $application->status,
                    'currentStage' => $application->current_stage,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'projectAddress' => $application->project_address,
                ];
            });

        return Inertia::render('Applications/DevelopmentClearance/ApplicationsIndex', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show the development clearance application form.
     */
    public function create(): Response
    {
        return Inertia::render('Applications/DevelopmentClearance/ApplicationForm');
    }

    /**
     * Store a newly created development clearance application.
     */
    public function store(StoreDevelopmentClearanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Verify open space percentage is at least 30%
        if ($validated['open_space_percentage'] < 30) {
            return back()->withErrors([
                'open_space_percentage' => 'Open space must be at least 30%.',
            ])->withInput();
        }

        $referenceNo = null;

        DB::transaction(function () use ($validated, &$referenceNo) {
            $referenceNo = SubdivisionApplication::generateReferenceNo();

            $application = SubdivisionApplication::create([
                'reference_no' => $referenceNo,
                'user_id' => Auth::id(),
                'zoning_clearance_no' => $validated['zoning_clearance_no'],
                'project_type' => $validated['project_type'],
                'applicant_type' => $validated['applicant_type'],
                'contact_number' => $validated['contact_number'],
                'contact_email' => $validated['contact_email'] ?? null,
                'pin_lat' => $validated['pin_lat'],
                'pin_lng' => $validated['pin_lng'],
                'project_address' => $validated['project_address'],
                'developer_name' => $validated['developer_name'],
                'subdivision_name' => $validated['subdivision_name'],
                'project_description' => $validated['project_description'] ?? null,
                'total_area_sqm' => $validated['total_area_sqm'],
                'total_lots_planned' => $validated['total_lots_planned'],
                'open_space_percentage' => $validated['open_space_percentage'],
                'current_stage' => 'concept',
                'status' => 'submitted',
                'submitted_at' => now(),
                // Building fields (only if project_type is subdivision_with_building)
                'building_type' => $validated['building_type'] ?? null,
                'number_of_floors' => $validated['number_of_floors'] ?? null,
                'building_footprint_sqm' => $validated['building_footprint_sqm'] ?? null,
                'total_floor_area_sqm' => $validated['total_floor_area_sqm'] ?? null,
                'front_setback_m' => $validated['front_setback_m'] ?? null,
                'rear_setback_m' => $validated['rear_setback_m'] ?? null,
                'side_setback_m' => $validated['side_setback_m'] ?? null,
                'floor_area_ratio' => $validated['floor_area_ratio'] ?? null,
                'building_open_space_sqm' => $validated['building_open_space_sqm'] ?? null,
                'building_review_status' => $validated['project_type'] === 'subdivision_with_building' ? 'pending' : null,
            ]);

            // Create initial history record
            SbrApplicationHistory::create([
                'application_type' => 'subdivision',
                'application_id' => $application->id,
                'status' => 'submitted',
                'remarks' => 'Development Clearance application submitted',
                'updated_by' => Auth::id(),
                'updated_at' => now(),
            ]);
        });

        return redirect()->route('development-clearance.show', [
            'id' => DB::table('subdivision_applications')
                ->where('reference_no', $referenceNo)
                ->value('id'),
        ])->with('success', 'Development Clearance application submitted successfully. Reference: '.$referenceNo);
    }

    /**
     * Display the specified development clearance application.
     */
    public function show(string $id): Response
    {
        $application = SubdivisionApplication::with([
            'documents',
            'stageReviews',
            'issuedCertificate',
        ])->findOrFail($id);

        // Check authorization
        if ($application->user_id !== Auth::id() && ! in_array(Auth::user()->role, ['staff', 'admin'])) {
            abort(403);
        }

        return Inertia::render('Applications/DevelopmentClearance/ApplicationDetails', [
            'application' => [
                'id' => $application->id,
                'referenceNo' => $application->reference_no,
                'projectType' => $application->project_type,
                'zoningClearanceNo' => $application->zoning_clearance_no,
                'applicantType' => $application->applicant_type,
                'contactNumber' => $application->contact_number,
                'contactEmail' => $application->contact_email,
                'pinLat' => $application->pin_lat,
                'pinLng' => $application->pin_lng,
                'projectAddress' => $application->project_address,
                'developerName' => $application->developer_name,
                'subdivisionName' => $application->subdivision_name,
                'projectDescription' => $application->project_description,
                'totalAreaSqm' => $application->total_area_sqm,
                'totalLotsPlanned' => $application->total_lots_planned,
                'openSpacePercentage' => $application->open_space_percentage,
                'buildingType' => $application->building_type,
                'numberOfFloors' => $application->number_of_floors,
                'buildingFootprintSqm' => $application->building_footprint_sqm,
                'totalFloorAreaSqm' => $application->total_floor_area_sqm,
                'frontSetbackM' => $application->front_setback_m,
                'rearSetbackM' => $application->rear_setback_m,
                'sideSetbackM' => $application->side_setback_m,
                'floorAreaRatio' => $application->floor_area_ratio,
                'buildingOpenSpaceSqm' => $application->building_open_space_sqm,
                'buildingReviewStatus' => $application->building_review_status,
                'currentStage' => $application->current_stage,
                'status' => $application->status,
                'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
