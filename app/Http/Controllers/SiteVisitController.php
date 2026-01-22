<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSiteVisitRequest;
use App\Models\BeneficiaryApplication;
use App\Models\SiteVisit;
use App\Services\SiteVisitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteVisitController extends Controller
{
    public function __construct(
        protected SiteVisitService $siteVisitService
    ) {}

    /**
     * Display a listing of site visits.
     */
    public function index(Request $request): Response
    {
        $query = SiteVisit::with(['beneficiary', 'application']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $paginator = $query->orderBy('scheduled_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15));

        $siteVisits = $paginator->through(function ($visit) {
            return [
                'id' => (string) $visit->id,
                'application_id' => (string) $visit->application_id,
                'beneficiary' => $visit->beneficiary?->full_name ?? 'N/A',
                'application_no' => $visit->application?->application_no ?? 'N/A',
                'scheduled_date' => $visit->scheduled_date->format('Y-m-d'),
                'visit_date' => $visit->visit_date?->format('Y-m-d'),
                'status' => $visit->status,
                'recommendation' => $visit->recommendation,
            ];
        });

        return Inertia::render('Admin/Housing/SiteVisitsIndex', [
            'siteVisits' => $siteVisits,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Store a newly created site visit.
     */
    public function store(StoreSiteVisitRequest $request): RedirectResponse
    {
        $application = BeneficiaryApplication::findOrFail($request->application_id);

        $this->authorize('create', SiteVisit::class);

        $visit = $this->siteVisitService->scheduleVisit(
            $application,
            auth()->id(),
            new \DateTime($request->scheduled_date),
            $request->address_visited
        );

        return redirect()->back()->with('success', 'Site visit scheduled successfully.');
    }

    /**
     * Complete a site visit.
     */
    public function complete(Request $request, string $id): RedirectResponse
    {
        $visit = SiteVisit::findOrFail($id);

        $this->authorize('update', $visit);

        $request->validate([
            'living_conditions' => ['required', 'string', 'max:2000'],
            'findings' => ['required', 'string', 'max:2000'],
            'recommendation' => ['required', 'in:eligible,not_eligible,needs_followup'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->siteVisitService->completeVisit(
            $visit,
            $request->living_conditions,
            $request->findings,
            $request->recommendation,
            $request->remarks
        );

        return redirect()->back()->with('success', 'Site visit completed successfully.');
    }
}
