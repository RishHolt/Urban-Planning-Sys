<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AllocationHistory;
use App\Models\AuditLog;
use App\Models\BeneficiaryApplication;
use App\Services\BlacklistService;
use App\Services\NotificationService;
use App\Services\SiteVisitService;
use App\Services\WaitlistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminHousingBeneficiaryController extends Controller
{
    public function __construct(
        protected BlacklistService $blacklistService,
        protected SiteVisitService $siteVisitService,
        protected WaitlistService $waitlistService
    ) {}

    /**
     * Display a listing of all housing applications.
     */
    public function index(Request $request): Response
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

        $paginator = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15));

        $applications = $paginator->through(function ($application) {
            return [
                'id' => (string) $application->id,
                'application_no' => $application->application_no,
                'beneficiary' => $application->beneficiary->full_name,
                'beneficiary_no' => $application->beneficiary->beneficiary_no,
                'housing_program' => $application->housing_program,
                'application_status' => $application->application_status,
                'eligibility_status' => $application->eligibility_status,
                'submitted_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'created_at' => $application->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/Housing/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status', 'housing_program', 'eligibility_status', 'dateFrom', 'dateTo']),
        ]);
    }
