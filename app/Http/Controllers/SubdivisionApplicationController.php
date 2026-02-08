<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubdivisionApplicationRequest;
use App\Models\SbrApplicationHistory;
use App\Models\SubdivisionApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubdivisionApplicationController extends Controller
{
    /**
     * Display a listing of the user's subdivision applications.
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

        return Inertia::render('Applications/Subdivision/ApplicationsIndex', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show the subdivision application form.
     */
    public function create(): Response
    {
        return Inertia::render('Applications/Subdivision/ApplicationForm');
    }

    /**
     * Store a newly created subdivision application.
     */
    public function store(StoreSubdivisionApplicationRequest $request): RedirectResponse
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
            ]);

            // Create initial history record
            SbrApplicationHistory::create([
                'application_type' => 'subdivision',
                'application_id' => $application->id,
                'status' => 'submitted',
                'remarks' => 'Application submitted',
                'updated_by' => Auth::id(),
                'updated_at' => now(),
            ]);
        });

        return redirect()->route('subdivision-applications.show', ['id' => DB::table('subdivision_applications')->where('reference_no', $referenceNo)->value('id')])
            ->with('success', 'Subdivision application submitted successfully. Reference: '.$referenceNo);
    }

    /**
     * Display the specified subdivision application.
     */
    public function show(string $id): Response
    {
        $application = SubdivisionApplication::with([
            'documents',
            'stageReviews',
            'issuedCertificate',
            'history',
        ])->findOrFail($id);

        // Check authorization
        if ($application->user_id !== Auth::id() && ! in_array(Auth::user()->role, ['staff', 'admin'])) {
            abort(403);
        }

        return Inertia::render('Applications/Subdivision/ApplicationDetails', [
            'application' => [
                'id' => $application->id,
                'referenceNo' => $application->reference_no,
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
                'currentStage' => $application->current_stage,
                'status' => $application->status,
                'denialReason' => $application->denial_reason,
                'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'approvedAt' => $application->approved_at?->format('Y-m-d H:i:s'),
                'documents' => $application->documents->map(fn ($doc) => [
                    'id' => $doc->id,
                    'documentType' => $doc->document_type,
                    'stage' => $doc->stage,
                    'fileName' => $doc->file_name,
                    'filePath' => $doc->file_path,
                    'uploadedAt' => $doc->uploaded_at?->format('Y-m-d H:i:s'),
                ]),
                'stageReviews' => $application->stageReviews->map(fn ($review) => [
                    'id' => $review->id,
                    'stage' => $review->stage,
                    'result' => $review->result,
                    'findings' => $review->findings,
                    'recommendations' => $review->recommendations,
                    'reviewedAt' => $review->reviewed_at?->format('Y-m-d H:i:s'),
                ]),
                'issuedCertificate' => $application->issuedCertificate ? [
                    'certificateNo' => $application->issuedCertificate->certificate_no,
                    'issueDate' => $application->issuedCertificate->issue_date->format('Y-m-d'),
                    'validUntil' => $application->issuedCertificate->valid_until?->format('Y-m-d'),
                    'status' => $application->issuedCertificate->status,
                ] : null,
                'history' => $application->history->map(fn ($h) => [
                    'status' => $h->status,
                    'remarks' => $h->remarks,
                    'updatedAt' => $h->updated_at->format('Y-m-d H:i:s'),
                ]),
            ],
        ]);
    }
}
