<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBuildingPlanCheckRequest;
use App\Models\BuildingPlanCheck;
use App\Models\BuildingReview;
use App\Models\SbrApplicationHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminBuildingReviewController extends Controller
{
    /**
     * Display a listing of all building reviews.
     */
    public function index(Request $request): Response
    {
        $query = BuildingReview::with('planChecks');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('pl_reference_no', 'like', "%{$search}%")
                    ->orWhere('building_permit_no', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($review) {
                return [
                    'id' => (string) $review->id,
                    'plReferenceNo' => $review->pl_reference_no,
                    'buildingPermitNo' => $review->building_permit_no,
                    'applicantName' => $review->applicant_name,
                    'status' => $review->status,
                    'fetchedAt' => $review->fetched_at?->format('Y-m-d H:i:s'),
                    'reviewedAt' => $review->reviewed_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Building/ReviewsIndex', [
            'reviews' => $reviews,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display the specified building review.
     */
    public function show(string $id): Response
    {
        $review = BuildingReview::with(['planChecks', 'history'])->findOrFail($id);

        return Inertia::render('Admin/Building/ReviewDetails', [
            'review' => [
                'id' => $review->id,
                'plReferenceNo' => $review->pl_reference_no,
                'zoningClearanceNo' => $review->zoning_clearance_no,
                'buildingPermitNo' => $review->building_permit_no,
                'applicantName' => $review->applicant_name,
                'contactNumber' => $review->contact_number,
                'projectAddress' => $review->project_address,
                'projectDescription' => $review->project_description,
                'numberOfStoreys' => $review->number_of_storeys,
                'floorAreaSqm' => $review->floor_area_sqm,
                'status' => $review->status,
                'denialReason' => $review->denial_reason,
                'fetchedAt' => $review->fetched_at?->format('Y-m-d H:i:s'),
                'reviewedAt' => $review->reviewed_at?->format('Y-m-d H:i:s'),
                'postedAt' => $review->posted_at?->format('Y-m-d H:i:s'),
                'planChecks' => $review->planChecks->map(fn ($check) => [
                    'id' => $check->id,
                    'checkType' => $check->check_type,
                    'result' => $check->result,
                    'findings' => $check->findings,
                    'recommendations' => $check->recommendations,
                    'reviewedAt' => $check->reviewed_at?->format('Y-m-d H:i:s'),
                ]),
                'history' => $review->history->map(fn ($h) => [
                    'status' => $h->status,
                    'remarks' => $h->remarks,
                    'updatedAt' => $h->updated_at->format('Y-m-d H:i:s'),
                ]),
            ],
        ]);
    }

    /**
     * Store a building plan check.
     */
    public function storePlanCheck(StoreBuildingPlanCheckRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $check = BuildingPlanCheck::create([
            'building_review_id' => $validated['building_review_id'],
            'check_type' => $validated['check_type'],
            'reviewer_id' => Auth::id(),
            'findings' => $validated['findings'] ?? null,
            'recommendations' => $validated['recommendations'] ?? null,
            'result' => $validated['result'],
            'reviewed_at' => now(),
        ]);

        $review = BuildingReview::findOrFail($validated['building_review_id']);

        // Update review status if all checks are completed
        $allChecks = BuildingPlanCheck::where('building_review_id', $review->id)->get();
        if ($allChecks->count() >= 3) {
            $allPassed = $allChecks->every(fn ($c) => $c->result === 'passed');
            $review->update([
                'status' => $allPassed ? 'approved' : 'denied',
                'reviewed_at' => now(),
                'denial_reason' => $allPassed ? null : 'One or more plan checks failed',
            ]);

            // Create history record
            SbrApplicationHistory::create([
                'application_type' => 'building',
                'application_id' => $review->id,
                'status' => $allPassed ? 'approved' : 'denied',
                'remarks' => 'All plan checks completed',
                'updated_by' => Auth::id(),
                'updated_at' => now(),
            ]);
        } else {
            $review->update(['status' => 'under_review']);
        }

        return back()->with('success', 'Plan check recorded successfully.');
    }

    /**
     * POST review result back to Permit & Licensing.
     */
    public function postToPermitLicensing(string $id): RedirectResponse
    {
        $review = BuildingReview::with('planChecks')->findOrFail($id);

        if ($review->status !== 'approved' && $review->status !== 'denied') {
            return back()->withErrors(['status' => 'Review must be approved or denied before posting to P&L.']);
        }

        // TODO: Implement API call to POST to Permit & Licensing system
        // For now, just mark as posted
        $review->update([
            'posted_at' => now(),
            'status' => 'posted',
        ]);

        // Create history record
        SbrApplicationHistory::create([
            'application_type' => 'building',
            'application_id' => $review->id,
            'status' => 'posted',
            'remarks' => 'Review result posted to Permit & Licensing',
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Review result posted to Permit & Licensing successfully.');
    }
}
