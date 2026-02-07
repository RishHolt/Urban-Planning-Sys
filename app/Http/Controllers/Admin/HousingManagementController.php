<?php

namespace App\Http\Controllers\Admin;

use App\BeneficiarySector;
use App\BeneficiaryStatus;
use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Services\BeneficiarySectorService;
use App\Services\HousingBeneficiaryPriorityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HousingManagementController extends Controller
{
    public function __construct(
        protected BeneficiarySectorService $sectorService,
        protected HousingBeneficiaryPriorityService $priorityService
    ) {}

    /**
     * Display consolidated housing management page with applications and beneficiaries tabs.
     */
    public function index(Request $request): Response
    {
        $view = $request->get('view', 'applications'); // 'applications' or 'beneficiaries'

        $applications = null;
        $beneficiaries = null;

        // Load applications if on applications tab or if view is not specified
        if ($view === 'applications' || ! $request->has('view')) {
            $applications = $this->getApplications($request);
        }

        // Load beneficiaries if on beneficiaries tab
        if ($view === 'beneficiaries') {
            $beneficiaries = $this->getBeneficiaries($request);
        }

        return Inertia::render('Admin/Housing/HousingManagement', [
            'applications' => $applications,
            'beneficiaries' => $beneficiaries,
            'filters' => $request->only([
                'view',
                'search',
                'status',
                'housing_program',
                'eligibility_status',
                'sector',
                'barangay',
                'dateFrom',
                'dateTo',
                'ranked',
            ]),
        ]);
    }

    /**
     * Get applications data.
     */
    private function getApplications(Request $request): array
    {
        $query = BeneficiaryApplication::with('beneficiary');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_no', 'like', "%{$search}%")
                    ->orWhereHas('beneficiary', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('beneficiary_no', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('application_status', $request->status);
        }

        // Filter by housing program
        if ($request->has('housing_program') && $request->housing_program) {
            $query->where('housing_program', $request->housing_program);
        }

        // Filter by eligibility status
        if ($request->has('eligibility_status') && $request->eligibility_status) {
            $query->where('eligibility_status', $request->eligibility_status);
        }

        // Date range filter
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->whereDate('submitted_at', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->whereDate('submitted_at', '<=', $request->dateTo);
        }

        // Check if ranking is requested
        $ranked = $request->boolean('ranked', false);

        if ($ranked) {
            // Get all applications and calculate priority scores
            $allApplications = $query->with('beneficiary.householdMembers')->get();
            $applicationsWithScores = $allApplications->map(function ($application) {
                return [
                    'application' => $application,
                    'priority_score' => $this->priorityService->calculatePriorityScore($application),
                ];
            })->sortByDesc('priority_score');

            // Calculate rank
            $rank = 1;
            $previousScore = null;
            $applicationsWithRanks = $applicationsWithScores->map(function ($item) use (&$rank, &$previousScore) {
                if ($previousScore !== null && $item['priority_score'] < $previousScore) {
                    $rank = $rank + 1;
                }
                $previousScore = $item['priority_score'];

                return [
                    'id' => (string) $item['application']->id,
                    'applicationNumber' => $item['application']->application_no,
                    'applicantName' => $item['application']->beneficiary->full_name,
                    'beneficiary_no' => $item['application']->beneficiary->beneficiary_no,
                    'projectType' => str_replace('_', ' ', ucfirst($item['application']->housing_program)),
                    'status' => is_object($item['application']->application_status) ? $item['application']->application_status->value : $item['application']->application_status,
                    'eligibility_status' => is_object($item['application']->eligibility_status) ? $item['application']->eligibility_status->value : $item['application']->eligibility_status,
                    'priority_score' => $item['priority_score'],
                    'rank' => $rank,
                    'municipality' => 'Cauayan City',
                    'barangay' => $item['application']->beneficiary?->barangay,
                    'submittedAt' => $item['application']->submitted_at?->format('Y-m-d H:i:s'),
                    'createdAt' => $item['application']->created_at?->format('Y-m-d H:i:s'),
                ];
            });

            return [
                'data' => $applicationsWithRanks->values()->all(),
                'links' => [],
                'meta' => [
                    'total' => $applicationsWithRanks->count(),
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $applicationsWithRanks->count(),
                ],
            ];
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'applicationNumber' => $application->application_no,
                    'applicantName' => $application->beneficiary->full_name,
                    'beneficiary_no' => $application->beneficiary->beneficiary_no,
                    'projectType' => str_replace('_', ' ', ucfirst($application->housing_program)),
                    'status' => is_object($application->application_status) ? $application->application_status->value : $application->application_status,
                    'eligibility_status' => is_object($application->eligibility_status) ? $application->eligibility_status->value : $application->eligibility_status,
                    'municipality' => 'Cauayan City',
                    'barangay' => $application->beneficiary?->barangay,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return [
            'data' => $applications->items(),
            'links' => $applications->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
                'from' => $applications->firstItem(),
                'to' => $applications->lastItem(),
            ],
        ];
    }

    /**
     * Get beneficiaries data.
     */
    private function getBeneficiaries(Request $request): array
    {
        $query = Beneficiary::with(['applications', 'householdMembers']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('beneficiary_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('beneficiary_status', $request->status);
        } else {
            // By default, exclude "applicant" status - only show actual beneficiaries
            $query->where('beneficiary_status', '!=', BeneficiaryStatus::Applicant);
        }

        // Filter by sector
        if ($request->has('sector') && $request->sector) {
            $query->whereJsonContains('sector_tags', $request->sector);
        }

        // Filter by barangay
        if ($request->has('barangay') && $request->barangay) {
            $query->where('barangay', $request->barangay);
        }

        $beneficiaries = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($beneficiary) {
                return [
                    'id' => (string) $beneficiary->id,
                    'beneficiary_no' => $beneficiary->beneficiary_no,
                    'full_name' => $beneficiary->full_name,
                    'email' => $beneficiary->email,
                    'contact_number' => $beneficiary->contact_number,
                    'barangay' => $beneficiary->barangay,
                    'sectors' => array_map(fn ($s) => BeneficiarySector::from($s)->label(), $beneficiary->sector_tags ?? []),
                    'status' => $beneficiary->beneficiary_status?->label() ?? null,
                    'total_applications' => $beneficiary->applications->count(),
                    'registered_at' => $beneficiary->registered_at?->format('Y-m-d'),
                ];
            });

        return [
            'data' => $beneficiaries->items(),
            'links' => $beneficiaries->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $beneficiaries->currentPage(),
                'last_page' => $beneficiaries->lastPage(),
                'per_page' => $beneficiaries->perPage(),
                'total' => $beneficiaries->total(),
            ],
        ];
    }
}
