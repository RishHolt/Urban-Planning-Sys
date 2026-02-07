<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Award;
use App\Services\AwardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AwardController extends Controller
{
    public function __construct(
        protected AwardService $awardService
    ) {}

    /**
     * Display a listing of awards.
     */
    public function index(Request $request): Response
    {
        $query = Award::with(['beneficiary', 'application', 'project', 'unit']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('award_no', 'like', "%{$search}%")
                    ->orWhereHas('beneficiary', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('beneficiary_no', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('award_status', $request->status);
        }

        // Filter by project
        if ($request->has('project_id') && $request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        $awards = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($award) {
                return [
                    'id' => (string) $award->id,
                    'award_no' => $award->award_no,
                    'beneficiary_name' => $award->beneficiary->full_name,
                    'beneficiary_no' => $award->beneficiary->beneficiary_no,
                    'project_name' => $award->project->project_name,
                    'unit_no' => $award->unit?->unit_no,
                    'award_status' => $award->award_status,
                    'award_date' => $award->award_date?->format('Y-m-d'),
                    'acceptance_deadline' => $award->acceptance_deadline?->format('Y-m-d'),
                    'accepted_date' => $award->accepted_date?->format('Y-m-d'),
                ];
            });

        return Inertia::render('Admin/Housing/AwardsIndex', [
            'awards' => $awards,
            'filters' => $request->only(['search', 'status', 'project_id']),
        ]);
    }

    /**
     * Display the specified award.
     */
    public function show(string $id): Response
    {
        $award = Award::with([
            'beneficiary',
            'application',
            'allocation',
            'project',
            'unit',
            'generator',
            'approver',
        ])->findOrFail($id);

        $this->authorize('view', $award);

        return Inertia::render('Admin/Housing/AwardDetails', [
            'award' => [
                'id' => (string) $award->id,
                'award_no' => $award->award_no,
                'beneficiary' => $award->beneficiary,
                'application' => $award->application,
                'allocation' => $award->allocation,
                'project' => $award->project,
                'unit' => $award->unit,
                'award_status' => $award->award_status,
                'award_date' => $award->award_date?->format('Y-m-d'),
                'acceptance_deadline' => $award->acceptance_deadline?->format('Y-m-d'),
                'accepted_date' => $award->accepted_date?->format('Y-m-d'),
                'declined_date' => $award->declined_date?->format('Y-m-d'),
                'turnover_date' => $award->turnover_date?->format('Y-m-d'),
                'approval_remarks' => $award->approval_remarks,
                'rejection_reason' => $award->rejection_reason,
                'acceptance_remarks' => $award->acceptance_remarks,
                'decline_reason' => $award->decline_reason,
                'notification_sent' => $award->notification_sent,
                'notification_sent_at' => $award->notification_sent_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Approve an award.
     */
    public function approve(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'approval_remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $award = Award::findOrFail($id);
        $this->authorize('approve', $award);
        $this->awardService->approveAward($award, auth()->id(), $request->approval_remarks);

        return back()->with('success', 'Award approved successfully.');
    }

    /**
     * Reject an award.
     */
    public function reject(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $award = Award::findOrFail($id);
        $this->authorize('reject', $award);
        $this->awardService->rejectAward($award, auth()->id(), $request->rejection_reason);

        return back()->with('success', 'Award rejected successfully.');
    }

    /**
     * Schedule unit turnover.
     */
    public function scheduleTurnover(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'turnover_date' => ['required', 'date', 'after:today'],
        ]);

        $award = Award::findOrFail($id);
        $this->authorize('scheduleTurnover', $award);
        $this->awardService->scheduleTurnover($award, new \DateTime($request->turnover_date));

        return back()->with('success', 'Unit turnover scheduled successfully.');
    }
}
