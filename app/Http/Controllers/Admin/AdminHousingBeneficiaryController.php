<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BeneficiaryApplication;
use App\Services\ApplicationValidationService;
use App\Services\BlacklistService;
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
    ) {}

    /**
     * Display a listing of all housing applications and beneficiaries (combined view).
     */
    public function index(Request $request): Response
    {
        $view = $request->get('view', 'applications'); // 'applications' or 'beneficiaries'

        $applications = null;
        $beneficiaries = null;

        // Load applications if on applications tab or if view is not specified
        if ($view === 'applications' || ! $request->has('view')) {
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

        // Load beneficiaries if on beneficiaries tab
        if ($view === 'beneficiaries') {
            $benQuery = \App\Models\Beneficiary::with(['applications', 'householdMembers']);

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $benQuery->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('beneficiary_no', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $benQuery->where('beneficiary_status', $request->status);
            }

            // Filter by sector
            if ($request->has('sector') && $request->sector) {
                $benQuery->whereJsonContains('sector_tags', $request->sector);
            }

            // Filter by barangay
            if ($request->has('barangay') && $request->barangay) {
                $benQuery->where('barangay', $request->barangay);
            }

            $beneficiaries = $benQuery->orderBy('created_at', 'desc')
                ->paginate($request->get('perPage', 15))
                ->through(function ($beneficiary) {
                    return [
                        'id' => (string) $beneficiary->id,
                        'beneficiary_no' => $beneficiary->beneficiary_no,
                        'full_name' => $beneficiary->full_name,
                        'email' => $beneficiary->email,
                        'contact_number' => $beneficiary->contact_number,
                        'barangay' => $beneficiary->barangay,
                        'sectors' => array_map(fn ($s) => \App\BeneficiarySector::from($s)->label(), $beneficiary->sector_tags ?? []),
                        'status' => $beneficiary->beneficiary_status?->label() ?? null,
                        'total_applications' => $beneficiary->applications->count(),
                        'registered_at' => $beneficiary->registered_at?->format('Y-m-d'),
                    ];
                });
        }

        return Inertia::render('Admin/Housing/ApplicationsIndex', [
            'applications' => $applications,
            'beneficiaries' => $beneficiaries,
            'filters' => $request->only(['view', 'search', 'status', 'housing_program', 'eligibility_status', 'sector', 'barangay', 'dateFrom', 'dateTo']),
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
        ]);
    }

    /**
     * Update the application status.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'application_status' => ['required', 'in:submitted,under_review,site_visit_scheduled,site_visit_completed,verified,approved,rejected,waitlisted,allocated,cancelled'],
            'eligibility_status' => ['sometimes', 'in:pending,eligible,not_eligible,conditional'],
            'eligibility_remarks' => ['nullable', 'string', 'max:2000'],
            'denial_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $application = BeneficiaryApplication::findOrFail($id);
        $this->authorize('updateStatus', $application);

        $oldStatus = $application->application_status;
        $newStatus = $request->application_status;
        $newEligibilityStatus = $request->eligibility_status ?? $application->eligibility_status;

        $updateData = [
            'application_status' => $newStatus,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ];

        // Update eligibility status if provided
        if ($request->has('eligibility_status')) {
            $updateData['eligibility_status'] = $request->eligibility_status;
            
            // Automatically update application status based on eligibility determination
            if ($request->eligibility_status === 'eligible' && in_array($newStatus, ['submitted', 'under_review', 'site_visit_completed'])) {
                // If eligible and still in early stages, move to verified
                $updateData['application_status'] = 'verified';
                $newStatus = 'verified';
            } elseif ($request->eligibility_status === 'not_eligible' && $newStatus !== 'rejected') {
                // If not eligible, move to rejected
                $updateData['application_status'] = 'rejected';
                $newStatus = 'rejected';
            }
        }

        if ($request->has('eligibility_remarks')) {
            $updateData['eligibility_remarks'] = $request->eligibility_remarks;
        }

        if ($request->has('denial_reason')) {
            $updateData['denial_reason'] = $request->denial_reason;
        }

        $application->update($updateData);

        // Update beneficiary status based on eligibility and application status
        $beneficiary = $application->beneficiary;
        if ($beneficiary) {
            if ($newEligibilityStatus === 'eligible' && $newStatus === 'verified') {
                // Mark beneficiary as qualified when eligibility is confirmed
                if ($beneficiary->beneficiary_status === \App\BeneficiaryStatus::Applicant) {
                    $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Qualified]);
                }
            } elseif ($newEligibilityStatus === 'not_eligible' || $newStatus === 'rejected') {
                // Mark beneficiary as disqualified if not eligible or rejected
                $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Disqualified]);
            }
            
            // Auto-add to waitlist when moving to verified and eligible
            if ($newStatus === 'verified' && $newEligibilityStatus === 'eligible' && !$application->waitlistEntry) {
                $this->waitlistService->addToWaitlist($application);
                $application->update(['application_status' => 'waitlisted']);
                $newStatus = 'waitlisted';
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
            $eligibilityStatus = $eligibilityResult->determination === 'eligible' ? 'eligible' : 'not_eligible';
            $updateData = [
                'eligibility_status' => $eligibilityStatus,
                'eligibility_remarks' => $eligibilityResult->remarks,
            ];

            // Update application status based on eligibility determination
            if ($eligibilityResult->isEligible && $eligibilityResult->determination === 'eligible') {
                // Move to verified if eligible
                if (in_array($application->application_status, ['submitted', 'under_review', 'site_visit_completed'])) {
                    $updateData['application_status'] = 'verified';
                }
                
                // Update beneficiary status to qualified
                $beneficiary = $application->beneficiary;
                if ($beneficiary && $beneficiary->beneficiary_status === \App\BeneficiaryStatus::Applicant) {
                    $beneficiary->update(['beneficiary_status' => \App\BeneficiaryStatus::Qualified]);
                }
                
                $application->update($updateData);
                
                // Add to waitlist (this will update status to waitlisted)
                $this->waitlistService->addToWaitlist($application);
            } else {
                // Move to rejected if not eligible
                $updateData['application_status'] = 'rejected';
                $application->update($updateData);
                
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
}
