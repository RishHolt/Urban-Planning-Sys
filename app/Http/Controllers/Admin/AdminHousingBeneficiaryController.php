<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestDocumentsRequest;
use App\Models\AuditLog;
use App\Models\HousingBeneficiaryApplication;
use App\Models\HousingBeneficiaryStatusHistory;
use App\Services\HousingBeneficiaryLabelService;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminHousingBeneficiaryController extends Controller
{
    /**
     * Display a listing of all housing applications.
     */
    public function index(Request $request): Response
    {
        $query = HousingBeneficiaryApplication::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by application type
        if ($request->has('applicationType') && $request->applicationType) {
            $query->where('application_type', $request->applicationType);
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
                    'applicationNumber' => $application->application_number,
                    'applicationType' => HousingBeneficiaryLabelService::getApplicationTypeLabel($application->application_type),
                    'status' => $application->status,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Housing/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status', 'applicationType', 'dateFrom', 'dateTo']),
        ]);
    }

    /**
     * Display the specified housing application.
     */
    public function show(string $id): Response
    {
        $application = HousingBeneficiaryApplication::with(['documents', 'statusHistory', 'beneficiary', 'household'])
            ->findOrFail($id);

        $this->authorize('view', $application);

        // Automatically change status to "under_review" if it's currently "submitted"
        if ($application->status === 'submitted') {
            $oldStatus = $application->status;
            $application->update([
                'status' => 'under_review',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            HousingBeneficiaryStatusHistory::create([
                'housing_beneficiary_application_id' => $application->id,
                'status_from' => $oldStatus,
                'status_to' => 'under_review',
                'changed_by' => auth()->id(),
                'notes' => 'Application moved to review when admin viewed it.',
                'created_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'status_updated',
                'resource_type' => 'housing_beneficiary_application',
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
        $documents = $application->documents()
            ->where('is_current', true)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'documentType' => $doc->document_type,
                    'type' => $doc->type,
                    'manualId' => $doc->manual_id,
                    'fileName' => $doc->file_name,
                    'fileSize' => $doc->file_size,
                    'mimeType' => $doc->mime_type,
                    'url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
                    'status' => $doc->status ?? 'pending',
                    'version' => $doc->version ?? 1,
                ];
            });

        // Format status history
        $statusHistory = $application->statusHistory->map(function ($history) {
            return [
                'id' => $history->id,
                'statusFrom' => $history->status_from,
                'statusTo' => $history->status_to,
                'changedBy' => $history->changed_by,
                'notes' => $history->notes,
                'createdAt' => $history->created_at?->format('Y-m-d H:i:s'),
            ];
        })->sortByDesc('createdAt')->values();

        return Inertia::render('Admin/Housing/ApplicationDetails', [
            'application' => [
                'id' => (string) $application->id,
                'applicationNumber' => $application->application_number,
                'applicationType' => HousingBeneficiaryLabelService::getApplicationTypeLabel($application->application_type),
                'status' => $application->status,
                'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $application->updated_at?->format('Y-m-d H:i:s'),
                'beneficiary' => $application->beneficiary,
                'household' => $application->household,
                'applicationNotes' => $application->application_notes,
                'rejectionReason' => $application->rejection_reason,
                'adminNotes' => $application->admin_notes,
                'documents' => $documents,
                'statusHistory' => $statusHistory,
            ],
        ]);
    }

    /**
     * Update the application status.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:draft,submitted,under_review,approved,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'rejectionReason' => ['nullable', 'required_if:status,rejected', 'string', 'max:1000'],
        ]);

        $application = HousingBeneficiaryApplication::findOrFail($id);
        $this->authorize('updateStatus', $application);

        $oldStatus = $application->status;
        $newStatus = $request->status;

        $application->update([
            'status' => $newStatus,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'rejection_reason' => $request->rejectionReason ?? null,
            'admin_notes' => $request->notes ?? null,
        ]);

        if ($newStatus === 'approved') {
            $application->update([
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        }

        // Create status history entry
        HousingBeneficiaryStatusHistory::create([
            'housing_beneficiary_application_id' => $application->id,
            'status_from' => $oldStatus,
            'status_to' => $newStatus,
            'changed_by' => auth()->id(),
            'notes' => $request->notes,
            'created_at' => now(),
        ]);

        // Log audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'status_updated',
            'resource_type' => 'housing_beneficiary_application',
            'resource_id' => (string) $application->id,
            'changes' => [
                'status_from' => $oldStatus,
                'status_to' => $newStatus,
                'notes' => $request->notes,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Create notification
        if ($newStatus === 'approved') {
            NotificationService::notifyApplicationApproved(
                $application->user_id,
                $application->application_number,
                $application->id
            );
        } elseif ($newStatus === 'rejected') {
            NotificationService::notifyApplicationRejected(
                $application->user_id,
                $application->application_number,
                $request->rejectionReason,
                $application->id
            );
        } else {
            NotificationService::notifyApplicationStatusChange(
                $application->user_id,
                $application->application_number,
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
    public function requestDocuments(RequestDocumentsRequest $request, string $id): RedirectResponse
    {
        $application = HousingBeneficiaryApplication::findOrFail($id);
        $this->authorize('view', $application);

        // Create notification for document request
        NotificationService::notifyDocumentRequest(
            $application->user_id,
            $application->application_number,
            $request->documentTypes,
            $request->message,
            $application->id
        );

        // Create status history entry
        HousingBeneficiaryStatusHistory::create([
            'housing_beneficiary_application_id' => $application->id,
            'status_from' => $application->status,
            'status_to' => $application->status,
            'changed_by' => auth()->id(),
            'notes' => 'Additional documents requested: '.implode(', ', $request->documentTypes).'. Message: '.$request->message,
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Document request sent to user.');
    }

    /**
     * Approve a document.
     */
    public function approveDocument(Request $request, string $id, string $documentId): RedirectResponse
    {
        $application = HousingBeneficiaryApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $oldStatus = $document->status ?? 'pending';
        $documentTypeName = HousingBeneficiaryLabelService::getDocumentTypeLabel($document->document_type);
        $notes = $request->input('notes', '');

        $document->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $notes,
        ]);

        $statusHistoryNotes = "Document '{$documentTypeName}' approved";
        if ($notes) {
            $statusHistoryNotes .= ": {$notes}";
        }

        HousingBeneficiaryStatusHistory::create([
            'housing_beneficiary_application_id' => $application->id,
            'status_from' => $application->status,
            'status_to' => $application->status,
            'changed_by' => $request->user()->id,
            'notes' => $statusHistoryNotes,
            'created_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'document_approved',
            'resource_type' => 'housing_beneficiary_document',
            'resource_id' => (string) $document->id,
            'changes' => [
                'status' => [$oldStatus => 'approved'],
                'notes' => $notes,
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
            'notes' => ['required', 'string', 'max:1000'],
        ], [
            'notes.required' => 'Notes are required when rejecting a document.',
        ]);

        $application = HousingBeneficiaryApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $oldStatus = $document->status ?? 'pending';
        $documentTypeName = HousingBeneficiaryLabelService::getDocumentTypeLabel($document->document_type);

        $document->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $validated['notes'],
        ]);

        $statusHistoryNotes = "Document '{$documentTypeName}' rejected: {$validated['notes']}";

        HousingBeneficiaryStatusHistory::create([
            'housing_beneficiary_application_id' => $application->id,
            'status_from' => $application->status,
            'status_to' => $application->status,
            'changed_by' => $request->user()->id,
            'notes' => $statusHistoryNotes,
            'created_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'document_rejected',
            'resource_type' => 'housing_beneficiary_document',
            'resource_id' => (string) $document->id,
            'changes' => [
                'status' => [$oldStatus => 'rejected'],
                'notes' => $validated['notes'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Document rejected successfully.');
    }
}
