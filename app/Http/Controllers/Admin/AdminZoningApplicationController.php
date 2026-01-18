<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ZoningApplication;
use App\Services\ZoningApplicationLabelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminZoningApplicationController extends Controller
{
    /**
     * Display a listing of all zoning applications.
     */
    public function index(Request $request): Response
    {
        $query = ZoningApplication::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by applicant type
        if ($request->has('applicantType') && $request->applicantType) {
            $query->where('applicant_type', $request->applicantType);
        }

        // Filter by municipality
        if ($request->has('municipality') && $request->municipality) {
            $query->where('municipality', 'like', "%{$request->municipality}%");
        }

        // Filter by barangay
        if ($request->has('barangay') && $request->barangay) {
            $query->where('barangay', 'like', "%{$request->barangay}%");
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
                    'applicantName' => $application->applicant_name,
                    'companyName' => $application->company_name,
                    'applicantType' => $application->applicant_type,
                    'status' => $application->status,
                    'projectType' => ZoningApplicationLabelService::getApplicationTypeLabel($application->application_type),
                    'municipality' => $application->municipality,
                    'barangay' => $application->barangay,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Zoning/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status', 'applicantType', 'municipality', 'barangay', 'dateFrom', 'dateTo']),
        ]);
    }

    /**
     * Display the specified zoning application.
     */
    public function show(string $id): Response
    {
        $application = ZoningApplication::with(['documents', 'statusHistory'])
            ->findOrFail($id);

        $this->authorize('view', $application);

        // Automatically change status to "in_review" if it's currently "pending"
        if ($application->status === 'pending') {
            $oldStatus = $application->status;
            $application->update([
                'status' => 'in_review',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            // Create status history entry
            \App\Models\ZoningApplicationStatusHistory::create([
                'zoning_application_id' => $application->id,
                'status_from' => $oldStatus,
                'status_to' => 'in_review',
                'changed_by' => auth()->id(),
                'notes' => 'Application moved to review when admin viewed it.',
                'created_at' => now(),
            ]);

            // Log audit
            \App\Models\AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'status_updated',
                'resource_type' => 'zoning_application',
                'resource_id' => (string) $application->id,
                'changes' => [
                    'status_from' => $oldStatus,
                    'status_to' => 'in_review',
                    'notes' => 'Application moved to review when admin viewed it.',
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Refresh the application to get updated status
            $application->refresh();
        }

        // Format documents with URLs - only show current versions
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

        // Format Valid ID path to URL
        $applicationData = $application->toArray();
        if (! empty($applicationData['valid_id_path'])) {
            $applicationData['valid_id_path_url'] = asset('storage/'.$applicationData['valid_id_path']);
        }

        return Inertia::render('Admin/Zoning/ApplicationDetails', [
            'application' => [
                'id' => (string) $application->id,
                'applicationNumber' => $application->application_number,
                'status' => $application->status,
                'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $application->updated_at?->format('Y-m-d H:i:s'),
                'projectType' => ZoningApplicationLabelService::getApplicationTypeLabel($application->application_type),
                'landType' => ZoningApplicationLabelService::getLandTypeLabel($application->land_type),
                'proposedUse' => ZoningApplicationLabelService::getProposedUseLabel($application->proposed_use),
                'applicantType' => ZoningApplicationLabelService::getApplicantTypeLabel($application->applicant_type),
                'data' => $applicationData,
                'documents' => $documents,
                'statusHistory' => $statusHistory,
            ],
        ]);
    }

    /**
     * Update the application status.
     */
    public function updateStatus(Request $request, string $id): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,in_review,approved,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $application = ZoningApplication::findOrFail($id);
        $this->authorize('updateStatus', $application);

        $oldStatus = $application->status;
        $newStatus = $request->status;

        $application->update([
            'status' => $newStatus,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Create status history entry
        \App\Models\ZoningApplicationStatusHistory::create([
            'zoning_application_id' => $application->id,
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
            'resource_type' => 'zoning_application',
            'resource_id' => (string) $application->id,
            'changes' => [
                'status_from' => $oldStatus,
                'status_to' => $newStatus,
                'notes' => $request->notes,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Application status updated successfully.');
    }

    /**
     * Get readable document type name.
     */
    private function getDocumentTypeName(string $documentType): string
    {
        $typeNames = [
            'authorization_letter' => 'Authorization Letter',
            'proof_of_ownership' => 'Proof of Ownership',
            'tax_declaration' => 'Tax Declaration',
            'site_development_plan' => 'Site Development Plan',
            'location_map' => 'Location Map / Vicinity Map',
            'vicinity_map' => 'Vicinity Map',
            'barangay_clearance' => 'Barangay Clearance',
            'letter_of_intent' => 'Letter of Intent',
            'proof_of_legal_authority' => 'Proof of Legal Authority',
            'endorsements_approvals' => 'Endorsements / Approvals',
            'environmental_compliance' => 'Environmental Compliance Certificate',
            'signature' => 'Digital Signature',
            'existing_building_photos' => 'Existing Building Photos',
            'other_documents' => 'Other Documents',
            'requested_documents' => 'Requested Documents',
        ];

        return $typeNames[$documentType] ?? str_replace('_', ' ', ucwords($documentType, '_'));
    }

    /**
     * Approve a document.
     */
    public function approveDocument(Request $request, string $id, string $documentId): \Illuminate\Http\RedirectResponse
    {
        $application = ZoningApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $oldStatus = $document->status ?? 'pending';
        $documentTypeName = $this->getDocumentTypeName($document->document_type);
        $notes = $request->input('notes', '');

        $document->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $notes,
        ]);

        // Create status history entry
        $statusHistoryNotes = "Document '{$documentTypeName}' approved";
        if ($notes) {
            $statusHistoryNotes .= ": {$notes}";
        }

        \App\Models\ZoningApplicationStatusHistory::create([
            'zoning_application_id' => $application->id,
            'status_from' => $application->status,
            'status_to' => $application->status, // Keep application status the same
            'changed_by' => $request->user()->id,
            'notes' => $statusHistoryNotes,
            'created_at' => now(),
        ]);

        // Log audit
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'document_approved',
            'resource_type' => 'zoning_application_document',
            'resource_id' => $document->id,
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
    public function rejectDocument(Request $request, string $id, string $documentId): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:1000'],
        ], [
            'notes.required' => 'Notes are required when rejecting a document.',
            'notes.string' => 'Notes must be a valid string.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ]);

        $application = ZoningApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $oldStatus = $document->status ?? 'pending';
        $documentTypeName = $this->getDocumentTypeName($document->document_type);

        $document->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $validated['notes'],
        ]);

        // Create status history entry
        $statusHistoryNotes = "Document '{$documentTypeName}' rejected: {$validated['notes']}";

        \App\Models\ZoningApplicationStatusHistory::create([
            'zoning_application_id' => $application->id,
            'status_from' => $application->status,
            'status_to' => $application->status, // Keep application status the same
            'changed_by' => $request->user()->id,
            'notes' => $statusHistoryNotes,
            'created_at' => now(),
        ]);

        // Log audit
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'document_rejected',
            'resource_type' => 'zoning_application_document',
            'resource_id' => $document->id,
            'changes' => [
                'status' => [$oldStatus => 'rejected'],
                'notes' => $validated['notes'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Document rejected successfully.');
    }

    /**
     * Get version history for a document (admin).
     */
    public function getDocumentVersions(Request $request, string $id, string $documentId): JsonResponse
    {
        try {
            $application = ZoningApplication::findOrFail($id);
            $this->authorize('view', $application);

            $currentDocument = $application->documents()
                ->where('id', $documentId)
                ->firstOrFail();

            // Get all versions of this document type (including all versions in the chain)
            $allVersions = $application->documents()
                ->where('document_type', $currentDocument->document_type)
                ->orderBy('version', 'desc')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'version' => $doc->version ?? 1,
                        'fileName' => $doc->file_name ?? 'Unknown',
                        'fileSize' => $doc->file_size ?? 0,
                        'status' => $doc->status ?? 'pending',
                        'url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
                        'mimeType' => $doc->mime_type ?? null,
                        'isCurrent' => (bool) ($doc->is_current ?? false),
                        'reviewedAt' => $doc->reviewed_at ? $doc->reviewed_at->format('Y-m-d H:i:s') : null,
                        'notes' => $doc->notes ?? null,
                        'createdAt' => $doc->created_at ? $doc->created_at->format('Y-m-d H:i:s') : null,
                    ];
                })
                ->values(); // Re-index array

            return response()->json([
                'versions' => $allVersions,
                'documentType' => $currentDocument->document_type,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Admin document version history - Model not found', [
                'application_id' => $id,
                'document_id' => $documentId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Document not found'], 404);
        } catch (\Exception $e) {
            Log::error('Admin document version history error', [
                'application_id' => $id,
                'document_id' => $documentId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Failed to load version history'], 500);
        }
    }
}
