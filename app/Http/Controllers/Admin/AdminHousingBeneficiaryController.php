<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BeneficiaryApplication;
use App\Models\AllocationHistory;
use App\Services\BlacklistService;
use App\Services\SiteVisitService;
use App\Services\WaitlistService;
use App\Services\NotificationService;
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

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($application) {
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

    /**
     * Display the specified housing application.
     */
    public function show(string $id): Response
    {
        $application = BeneficiaryApplication::with([
            'beneficiary',
            'documents',
            'siteVisits',
            'waitlistEntry',
            'allocation',
            'allocation.history',
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

        // Format documents
        $documents = $application->documents->map(function ($doc) {
            return [
                'id' => (string) $doc->id,
                'document_type' => $doc->document_type,
                'file_name' => $doc->file_name,
                'file_path' => $doc->file_path,
                'url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
                'verification_status' => $doc->verification_status,
                'verified_by' => $doc->verified_by,
                'verified_at' => $doc->verified_at?->format('Y-m-d H:i:s'),
            ];
        });

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
                'submitted_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'reviewed_at' => $application->reviewed_at?->format('Y-m-d H:i:s'),
                'approved_at' => $application->approved_at?->format('Y-m-d H:i:s'),
                'beneficiary' => $application->beneficiary,
                'documents' => $documents,
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

        // If marked as eligible, add to waitlist
        if ($newStatus === 'eligible' && $application->eligibility_status === 'eligible') {
            $this->waitlistService->addToWaitlist($application);
            $application->update(['application_status' => 'waitlisted']);
        }

        // Log audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'status_updated',
            'resource_type' => 'beneficiary_application',
            'resource_id' => (string) $application->id,
            'changes' => [
                'status_from' => $oldStatus,
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
                $oldStatus,
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
}
