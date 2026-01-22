<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSubdivisionStageRequest;
use App\Models\SbrApplicationHistory;
use App\Models\SubdivisionApplication;
use App\Models\SubdivisionStageReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubdivisionApplicationController extends Controller
{
    /**
     * Display a listing of all subdivision applications.
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

        if ($request->has('stage') && $request->stage) {
            $query->where('current_stage', $request->stage);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'referenceNo' => $application->reference_no,
                    'subdivisionName' => $application->subdivision_name,
                    'developerName' => $application->developer_name,
                    'status' => $application->status,
                    'currentStage' => $application->current_stage,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Subdivision/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'stage' => $request->stage,
            ],
        ]);
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

        return Inertia::render('Admin/Subdivision/ApplicationDetails', [
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

    /**
     * Review a subdivision application stage.
     */
    public function reviewStage(UpdateSubdivisionStageRequest $request, string $id): RedirectResponse
    {
        $application = SubdivisionApplication::findOrFail($id);
        $validated = $request->validated();

        $stageReview = SubdivisionStageReview::create([
            'application_id' => $application->id,
            'stage' => $validated['stage'],
            'reviewer_id' => Auth::id(),
            'findings' => $validated['findings'] ?? null,
            'recommendations' => $validated['recommendations'] ?? null,
            'result' => $validated['result'],
            'reviewed_at' => now(),
        ]);

        // Update application status based on result
        $newStatus = match ($validated['result']) {
            'approved' => $this->getNextStageStatus($validated['stage']),
            'revision_required' => 'revision',
            'denied' => 'denied',
        };

        $application->update([
            'status' => $newStatus,
            'current_stage' => $validated['result'] === 'approved' ? $this->getNextStage($validated['stage']) : $application->current_stage,
            'denial_reason' => $validated['result'] === 'denied' ? ($validated['findings'] ?? 'Application denied') : null,
        ]);

        // Create history record
        SbrApplicationHistory::create([
            'application_type' => 'subdivision',
            'application_id' => $application->id,
            'status' => $newStatus,
            'remarks' => $validated['findings'] ?? "Stage {$validated['stage']} reviewed",
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Stage review completed successfully.');
    }

    /**
     * Get the next stage after the current one.
     */
    private function getNextStage(string $currentStage): string
    {
        return match ($currentStage) {
            'concept' => 'preliminary',
            'preliminary' => 'improvement',
            'improvement' => 'final',
            'final' => 'final',
        };
    }

    /**
     * Get the status for the next stage.
     */
    private function getNextStageStatus(string $currentStage): string
    {
        return match ($currentStage) {
            'concept' => 'preliminary_review',
            'preliminary' => 'improvement_review',
            'improvement' => 'final_review',
            'final' => 'approved',
        };
    }
}
