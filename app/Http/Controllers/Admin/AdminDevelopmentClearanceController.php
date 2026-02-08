<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SbrApplicationHistory;
use App\Models\SubdivisionApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminDevelopmentClearanceController extends Controller
{
    /**
     * Display a listing of all development clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = SubdivisionApplication::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                    ->orWhere('subdivision_name', 'like', "%{$search}%")
                    ->orWhere('developer_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('project_type') && $request->project_type) {
            $query->where('project_type', $request->project_type);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'referenceNo' => $application->reference_no,
                    'projectType' => $application->project_type,
                    'subdivisionName' => $application->subdivision_name,
                    'developerName' => $application->developer_name,
                    'status' => $application->status,
                    'currentStage' => $application->current_stage,
                    'buildingReviewStatus' => $application->building_review_status,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/DevelopmentClearance/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'project_type' => $request->project_type,
            ],
        ]);
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
            'history',
        ])->findOrFail($id);

        return Inertia::render('Admin/DevelopmentClearance/ApplicationDetails', [
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

    /**
     * Submit a review decision for the application.
     */
    public function review(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'review_type' => 'required|in:subdivision,building',
            'decision' => 'required|in:approved,revision,denied',
            'comments' => 'nullable|string',
        ]);

        $application = SubdivisionApplication::findOrFail($id);

        // Update status based on review type
        if ($validated['review_type'] === 'subdivision') {
            if ($validated['decision'] === 'approved') {
                $application->status = 'approved';
                $application->approved_at = now();
            } elseif ($validated['decision'] === 'revision') {
                $application->status = 'revision';
            } else {
                $application->status = 'denied';
            }
        } else {
            // Building review
            $application->building_review_status = $validated['decision'];
        }

        $application->save();

        // Create history record
        SbrApplicationHistory::create([
            'application_type' => 'subdivision',
            'application_id' => $application->id,
            'status' => $application->status,
            'remarks' => $validated['comments'] ?? "{$validated['review_type']} review: {$validated['decision']}",
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Review submitted successfully.');
    }
}
