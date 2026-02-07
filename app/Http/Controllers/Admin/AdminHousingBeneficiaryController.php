<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BeneficiaryApplication;
use App\Services\ApplicationValidationService;
use App\Services\BlacklistService;
use App\Services\CaseOfficerService;
use App\Services\EligibilityService;
use App\Services\NotificationService;
use App\Services\SiteVisitService;
use App\Services\WaitlistService;
use Illuminate\Http\JsonResponse;
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
        protected WaitlistService $waitlistService,
        protected ApplicationValidationService $validationService,
        protected EligibilityService $eligibilityService,
        protected CaseOfficerService $caseOfficerService
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

        // Check if ranking is requested
        $ranked = $request->boolean('ranked', false);

        if ($ranked) {
            // Get all applications and calculate priority scores
            $allApplications = $query->with('beneficiary.householdMembers')->get();
            $priorityService = app(\App\Services\HousingBeneficiaryPriorityService::class);

            $applicationsWithScores = $allApplications->map(function ($application) use ($priorityService) {
                return [
                    'application' => $application,
                    'priority_score' => $priorityService->calculatePriorityScore($application),
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
                    'status' => $item['application']->application_status,
                    'eligibility_status' => $item['application']->eligibility_status,
                    'priority_score' => $item['priority_score'],
                    'rank' => $rank,
                    'municipality' => 'Cauayan City',
                    'barangay' => $item['application']->beneficiary?->barangay,
                    'submittedAt' => $item['application']->submitted_at?->format('Y-m-d H:i:s'),
                    'createdAt' => $item['application']->created_at?->format('Y-m-d H:i:s'),
                ];
            });

            // Paginate manually
            $page = $request->get('page', 1);
            $perPage = $request->get('perPage', 15);
            $offset = ($page - 1) * $perPage;
            $paginated = $applicationsWithRanks->slice($offset, $perPage)->values();

            $applications = new \Illuminate\Pagination\LengthAwarePaginator(
                $paginated,
                $applicationsWithRanks->count(),
                $perPage,
                $page,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        } else {
            $applications = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('perPage', 15))
                ->through(function ($application) {
                    return [
                        'id' => (string) $application->id,
                        'applicationNumber' => $application->application_no,
                        'applicantName' => $application->beneficiary->full_name,
                        'beneficiary_no' => $application->beneficiary->beneficiary_no,
                        'projectType' => str_replace('_', ' ', ucfirst($application->housing_program)),
                        'status' => $application->application_status,
                        'eligibility_status' => $application->eligibility_status,
                        'municipality' => 'Cauayan City',
                        'barangay' => $application->beneficiary?->barangay,
                        'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                        'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                    ];
                });
        }

        return Inertia::render('Admin/Housing/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status', 'housing_program', 'eligibility_status', 'dateFrom', 'dateTo']),
        ]);
    }

    /**
     * Display the specified housing application.
     */
    public function show(string $id): Response
    {
        $application = BeneficiaryApplication::with([
            'beneficiary',
            'beneficiary.householdMembers',
            'documents',
            'siteVisits',
            'waitlistEntry',
            'allocation',
            'allocation.history',
            'caseOfficer',
            'project',
        ])->findOrFail($id);

        $this->authorize('view', $application);

        // Automatically change status to "under_review" if it's currently "submitted"
        if ($application->application_status === 'submitted') {
            $oldStatus = $application->application_status;
            $application->update([
                'application_status' => 'under_review',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'status_updated',
                'resource_type' => 'beneficiary_application',
                'resource_id' => (string) $application->id,
                'changes' => [
                    'status_from' => $oldStatus,
                    'status_to' => 'under_review',
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $application->refresh();
        }

        // Format documents and calculate summary using service
        $documentSummaryService = app(\App\Services\DocumentSummaryService::class);
        $documents = $documentSummaryService->formatDocuments($application->documents);
        $documentSummary = $documentSummaryService->calculateSummary($application);

        // Format site visits
        $siteVisits = $application->siteVisits->map(function ($visit) {
            return [
                'id' => (string) $visit->id,
                'scheduled_date' => $visit->scheduled_date->format('Y-m-d'),
                'visit_date' => $visit->visit_date?->format('Y-m-d'),
                'status' => $visit->status,
                'address_visited' => $visit->address_visited,
                'living_conditions' => $visit->living_conditions,
                'findings' => $visit->findings,
                'recommendation' => $visit->recommendation,
                'remarks' => $visit->remarks,
            ];
        });

        // Format allocation history
        $allocationHistory = $application->allocation?->history->map(function ($history) {
            return [
                'id' => (string) $history->id,
                'status' => $history->status,
                'remarks' => $history->remarks,
                'updated_by' => $history->updated_by,
                'updated_at' => $history->updated_at->format('Y-m-d H:i:s'),
            ];
        }) ?? collect();

        // Get available case officers
        $caseOfficers = \App\Models\User::whereIn('role', ['housing_officer', 'social_worker'])
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->first_name.' '.$user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                ];
            });

        // Format case officer
        $caseOfficer = $application->caseOfficer ? [
            'id' => $application->caseOfficer->id,
            'name' => $application->caseOfficer->first_name.' '.$application->caseOfficer->last_name,
            'email' => $application->caseOfficer->email,
        ] : null;

        // Format beneficiary with complete information
        $beneficiary = $application->beneficiary;
        $beneficiaryData = [
            'id' => (string) $beneficiary->id,
            'beneficiary_no' => $beneficiary->beneficiary_no,
            'first_name' => $beneficiary->first_name,
            'middle_name' => $beneficiary->middle_name,
            'last_name' => $beneficiary->last_name,
            'suffix' => $beneficiary->suffix,
            'full_name' => $beneficiary->full_name,
            'birth_date' => $beneficiary->birth_date?->format('Y-m-d'),
            'age' => $beneficiary->age,
            'gender' => $beneficiary->gender,
            'civil_status' => $beneficiary->civil_status,
            'email' => $beneficiary->email,
            'contact_number' => $beneficiary->contact_number,
            'mobile_number' => $beneficiary->mobile_number,
            'telephone_number' => $beneficiary->telephone_number,
            'current_address' => $beneficiary->current_address,
            'address' => $beneficiary->address,
            'street' => $beneficiary->street,
            'barangay' => $beneficiary->barangay,
            'city' => $beneficiary->city,
            'province' => $beneficiary->province,
            'zip_code' => $beneficiary->zip_code,
            'years_of_residency' => $beneficiary->years_of_residency,
            'employment_status' => $beneficiary->employment_status,
            'occupation' => $beneficiary->occupation,
            'employer_name' => $beneficiary->employer_name,
            'monthly_income' => $beneficiary->monthly_income,
            'household_income' => $beneficiary->household_income,
            'has_existing_property' => $beneficiary->has_existing_property,
            'priority_status' => $beneficiary->priority_status,
            'priority_id_no' => $beneficiary->priority_id_no,
            'sector_tags' => $beneficiary->sector_tags,
        ];

        // Load household members
        $householdMembers = $beneficiary->householdMembers->map(function ($member) {
            return [
                'id' => (string) $member->id,
                'full_name' => $member->full_name,
                'relationship' => $member->relationship,
                'birth_date' => $member->birth_date?->format('Y-m-d'),
                'age' => $member->age,
                'gender' => $member->gender,
                'occupation' => $member->occupation,
                'monthly_income' => $member->monthly_income,
                'is_dependent' => $member->is_dependent,
            ];
        });

        return Inertia::render('Admin/Housing/ApplicationDetails', [
            'application' => [
                'id' => (string) $application->id,
                'application_no' => $application->application_no,
                'housing_program' => $application->housing_program,
                'application_reason' => $application->application_reason,
                'application_status' => $application->application_status,
                'eligibility_status' => $application->eligibility_status,
                'eligibility_remarks' => $application->eligibility_remarks,
                'denial_reason' => $application->denial_reason,
                'case_officer_id' => $application->case_officer_id,
                'case_officer' => $caseOfficer,
                'project_id' => $application->project_id,
                'project' => $application->project ? [
                    'id' => $application->project->id,
                    'project_name' => $application->project->project_name,
                    'project_code' => $application->project->project_code,
                ] : null,
                'submitted_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'reviewed_at' => $application->reviewed_at?->format('Y-m-d H:i:s'),
                'approved_at' => $application->approved_at?->format('Y-m-d H:i:s'),
                'beneficiary' => $beneficiaryData,
                'household_members' => $householdMembers,
                'documents' => $documents,
                'document_summary' => $documentSummary,
                'site_visits' => $siteVisits,
                'waitlist' => $application->waitlistEntry,
                'allocation' => $application->allocation,
                'allocation_history' => $allocationHistory,
            ],
            'case_officers' => $caseOfficers,
        ]);
    }

    /**
     * Update the application status.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'application_status' => ['required', 'in:submitted,under_review,site_visit_scheduled,site_visit_completed,eligible,not_eligible,waitlisted,allocated,cancelled'],
            'eligibility_status' => ['sometimes', 'in:pending,eligible,not_eligible'],
            'eligibility_remarks' => ['nullable', 'string', 'max:2000'],
            'denial_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $application = BeneficiaryApplication::findOrFail($id);
        $this->authorize('updateStatus', $application);

        $oldStatus = $application->application_status;
        $newStatus = $request->application_status;

        $updateData = [
            'application_status' => $newStatus,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ];

        if ($request->has('eligibility_status')) {
            $updateData['eligibility_status'] = $request->eligibility_status;
        }

        if ($request->has('eligibility_remarks')) {
            $updateData['eligibility_remarks'] = $request->eligibility_remarks;
        }

        if ($request->has('denial_reason')) {
            $updateData['denial_reason'] = $request->denial_reason;
        }

        $application->update($updateData);

        // Update beneficiary status based on application status
        $beneficiary = $application->beneficiary;
        if ($beneficiary) {
            if ($newStatus === 'eligible' && $application->eligibility_status === 'eligible') {
                // Mark beneficiary as qualified when application becomes eligible
                if ($beneficiary->beneficiary_status === \App\BeneficiaryStatus::Applicant) {
                    $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Qualified]);
                }
                // Add to waitlist (this will update status to waitlisted)
                $this->waitlistService->addToWaitlist($application);
                $application->update(['application_status' => 'waitlisted']);
            } elseif ($newStatus === 'not_eligible') {
                // Mark beneficiary as disqualified if application is not eligible
                $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Disqualified]);
            }
        }

        // Log audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'status_updated',
            'resource_type' => 'beneficiary_application',
            'resource_id' => (string) $application->id,
            'changes' => [
                'status_from' => $oldStatus instanceof \App\ApplicationStatus ? $oldStatus->value : (string) $oldStatus,
                'status_to' => $newStatus,
                'eligibility_status' => $request->eligibility_status ?? null,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Create notification
        if ($application->beneficiary->citizen_id) {
            NotificationService::notifyApplicationStatusChange(
                $application->beneficiary->citizen_id,
                $application->application_no,
                $oldStatus instanceof \App\ApplicationStatus ? $oldStatus->value : (string) $oldStatus,
                $newStatus,
                $application->id
            );
        }

        return redirect()->back()->with('success', 'Application status updated successfully.');
    }

    /**
     * Request additional documents from the user.
     */
    public function requestDocuments(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'document_types' => ['required', 'array', 'min:1'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $application = BeneficiaryApplication::findOrFail($id);
        $this->authorize('view', $application);

        // Create notification for document request
        if ($application->beneficiary->citizen_id) {
            NotificationService::notifyDocumentRequest(
                $application->beneficiary->citizen_id,
                $application->application_no,
                $request->document_types,
                $request->message ?? 'Please upload the requested documents.',
                $application->id
            );
        }

        return redirect()->back()->with('success', 'Document request sent to user.');
    }

    /**
     * Approve a document.
     */
    public function approveDocument(Request $request, string $id, string $documentId): RedirectResponse
    {
        $application = BeneficiaryApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $oldStatus = $document->verification_status;
        $document->update([
            'verification_status' => 'verified',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'document_approved',
            'resource_type' => 'beneficiary_document',
            'resource_id' => (string) $document->id,
            'changes' => [
                'verification_status' => [$oldStatus => 'verified'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Document approved successfully.');
    }

    /**
     * Reject a document.
     */
    public function rejectDocument(Request $request, string $id, string $documentId): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => ['required', 'string', 'max:1000'],
        ], [
            'remarks.required' => 'Remarks are required when rejecting a document.',
        ]);

        $application = BeneficiaryApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $oldStatus = $document->verification_status;
        $document->update([
            'verification_status' => 'invalid',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'document_rejected',
            'resource_type' => 'beneficiary_document',
            'resource_id' => (string) $document->id,
            'changes' => [
                'verification_status' => [$oldStatus => 'invalid'],
                'remarks' => $validated['remarks'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Document rejected successfully.');
    }

    /**
     * Validate an application and return detailed validation results.
     */
    public function validateApplication(string $id): JsonResponse
    {
        $application = BeneficiaryApplication::with(['beneficiary', 'documents'])->findOrFail($id);
        $this->authorize('validate', $application);

        $validationResult = $this->validationService->validateApplication($application);

        return response()->json([
            'success' => true,
            'data' => $validationResult->toArray(),
        ]);
    }

    /**
     * Check eligibility of an application.
     */
    public function checkEligibility(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'auto_update' => ['sometimes', 'boolean'],
        ]);

        $application = BeneficiaryApplication::with(['beneficiary', 'documents'])->findOrFail($id);
        $this->authorize('checkEligibility', $application);

        $eligibilityResult = $this->eligibilityService->checkEligibility($application);

        // Auto-update eligibility status if requested
        if ($request->boolean('auto_update')) {
            $application->update([
                'eligibility_status' => $eligibilityResult->determination === 'eligible' ? 'eligible' : 'not_eligible',
                'eligibility_remarks' => $eligibilityResult->remarks,
            ]);

            // If eligible, automatically add to waitlist
            if ($eligibilityResult->isEligible && $eligibilityResult->determination === 'eligible') {
                // Update beneficiary status to qualified first
                $beneficiary = $application->beneficiary;
                if ($beneficiary && $beneficiary->beneficiary_status === \App\BeneficiaryStatus::Applicant) {
                    $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Qualified]);
                }
                // Add to waitlist (this will update status to waitlisted)
                $this->waitlistService->addToWaitlist($application);
            } elseif ($eligibilityResult->determination === 'not_eligible') {
                // Mark beneficiary as disqualified if not eligible
                $beneficiary = $application->beneficiary;
                if ($beneficiary) {
                    $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Disqualified]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $eligibilityResult->toArray(),
            'auto_updated' => $request->boolean('auto_update'),
        ]);
    }

    /**
     * Assign a case officer to an application.
     */
    public function assignCaseOfficer(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'case_officer_id' => ['required', 'exists:users,id'],
        ]);

        $application = BeneficiaryApplication::findOrFail($id);
        $this->authorize('updateStatus', $application);

        $this->caseOfficerService->assignCaseOfficer($application, $request->case_officer_id);

        // Log audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'case_officer_assigned',
            'resource_type' => 'beneficiary_application',
            'resource_id' => (string) $application->id,
            'changes' => [
                'case_officer_id' => $request->case_officer_id,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Case officer assigned successfully.');
    }

    /**
     * Auto-assign a case officer to an application.
     */
    public function autoAssignCaseOfficer(string $id): RedirectResponse
    {
        $application = BeneficiaryApplication::findOrFail($id);
        $this->authorize('updateStatus', $application);

        $assignedOfficerId = $this->caseOfficerService->autoAssignCaseOfficer($application);

        if ($assignedOfficerId) {
            // Log audit
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'case_officer_auto_assigned',
                'resource_type' => 'beneficiary_application',
                'resource_id' => (string) $application->id,
                'changes' => [
                    'case_officer_id' => $assignedOfficerId,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return back()->with('success', 'Case officer auto-assigned successfully.');
        }

        return back()->withErrors(['error' => 'No available case officers found.']);
    }

    /**
     * Get case officer workload statistics.
     */
    public function getCaseOfficerWorkload(): JsonResponse
    {
        $statistics = $this->caseOfficerService->getWorkloadStatistics();

        return response()->json([
            'success' => true,
            'data' => $statistics,
        ]);
    }
}
