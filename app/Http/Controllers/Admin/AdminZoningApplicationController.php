<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ZoningApplicationResource;
use App\Models\User;
use App\Models\ZoningApplication;
use App\Models\ZoningApplicationDocument;
use App\Models\ZoningApplicationStatusHistory;
use Illuminate\Http\Request;
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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('proposed_use', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('applicantType')) {
            $query->where('applicant_type', $request->applicantType);
        }

        if ($request->filled('municipality')) {
            $query->where('municipality', 'like', "%{$request->municipality}%");
        }

        if ($request->filled('barangay')) {
            $query->where('barangay', 'like', "%{$request->barangay}%");
        }

        if ($request->filled('dateFrom')) {
            $query->where('application_date', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->where('application_date', '<=', $request->dateTo);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        $applications->getCollection()->transform(function ($application) {
            return (new ZoningApplicationResource($application))->resolve();
        });

        return Inertia::render('Admin/Zoning/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'applicantType' => $request->applicantType,
                'municipality' => $request->municipality,
                'barangay' => $request->barangay,
                'dateFrom' => $request->dateFrom,
                'dateTo' => $request->dateTo,
            ],
        ]);
    }

    /**
     * Display the specified zoning application.
     */
    public function show(string $id): Response
    {
        $application = ZoningApplication::with([
            'documents.versions',
            'statusHistory.changedBy.profile',
            'history.updatedBy.profile',
            'externalVerifications',
            'zone',
            'inspections.inspector.profile',
        ])->findOrFail($id);

        $inspectors = User::query()
            ->where('is_active', true)
            ->whereIn('role', ['admin', 'staff', 'super_admin'])
            ->with('profile')
            ->orderBy('email')
            ->get()
            ->map(static function (User $user): array {
                $profile = $user->profile;
                $name = '';
                if ($profile) {
                    $name = trim(implode(' ', array_filter([
                        $profile->first_name,
                        $profile->middle_name,
                        $profile->last_name,
                        $profile->suffix,
                    ])));
                }

                return [
                    'id' => $user->id,
                    'name' => $name !== '' ? $name : $user->email,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Admin/Zoning/ApplicationDetails', [
            'application' => (new ZoningApplicationResource($application))->resolve(),
            'inspectors' => $inspectors,
        ]);
    }

    /**
     * Update application status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,under_review,for_inspection,for_approval,approved,rejected'],
            'notes' => ['nullable', 'string'],
            'rejection_reason' => ['nullable', 'string', 'required_if:status,rejected'],
        ]);

        $application = ZoningApplication::findOrFail($id);
        $oldStatus = $application->status;

        $application->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $application->notes,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        if ($validated['status'] === 'approved') {
            $application->update([
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        }

        ZoningApplicationStatusHistory::create([
            'zoning_application_id' => $application->id,
            'status_from' => $oldStatus,
            'status_to' => $validated['status'],
            'changed_by' => auth()->id(),
            'notes' => $validated['notes'] ?? null,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Application status updated successfully.');
    }

    /**
     * Request additional documents from applicant.
     */
    public function requestDocuments(Request $request, string $id)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'requested_document_types' => ['nullable', 'array'],
        ]);

        $application = ZoningApplication::findOrFail($id);

        if (! in_array($application->status, ['pending', 'under_review'])) {
            return back()->withErrors([
                'status' => 'Document requests can only be made for pending or under review applications.',
            ]);
        }

        $oldStatus = $application->status;

        if ($application->status === 'under_review') {
            $application->update(['status' => 'pending']);
        }

        ZoningApplicationStatusHistory::create([
            'zoning_application_id' => $application->id,
            'status_from' => $oldStatus,
            'status_to' => 'pending',
            'notes' => 'Additional documents requested: '.$validated['message'],
            'changed_by' => auth()->id(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Document request sent to applicant.');
    }

    /**
     * Export applications to CSV.
     */
    public function export(Request $request)
    {
        $query = ZoningApplication::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('proposed_use', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('applicantType')) {
            $query->where('applicant_type', $request->applicantType);
        }

        if ($request->filled('municipality')) {
            $query->where('municipality', 'like', "%{$request->municipality}%");
        }

        if ($request->filled('barangay')) {
            $query->where('barangay', 'like', "%{$request->barangay}%");
        }

        if ($request->filled('dateFrom')) {
            $query->where('application_date', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->where('application_date', '<=', $request->dateTo);
        }

        $applications = $query->orderBy('created_at', 'desc')->get();

        $filename = 'zoning_applications_'.date('Y-m-d_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($applications) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Application Number',
                'Reference No',
                'Applicant Type',
                'Applicant Name',
                'Company Name',
                'Email',
                'Contact',
                'Province',
                'Municipality',
                'Barangay',
                'Lot Area',
                'Lot Area Total',
                'Application Type',
                'Project Type',
                'Proposed Use / Purpose',
                'Status',
                'Application Date',
                'Submitted At',
            ]);

            foreach ($applications as $application) {
                fputcsv($file, [
                    $application->application_number,
                    $application->reference_no,
                    $application->applicant_type,
                    $application->applicant_name,
                    $application->company_name ?? '',
                    $application->applicant_email,
                    $application->applicant_contact,
                    $application->province,
                    $application->municipality,
                    $application->barangay,
                    $application->lot_area,
                    $application->lot_area_total,
                    $application->application_type,
                    $application->project_type,
                    $application->proposed_use ?? $application->purpose,
                    $application->status,
                    $application->application_date?->format('Y-m-d'),
                    $application->submitted_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Approve a zoning document.
     */
    public function approveDocument(Request $request, string $id, string $documentId)
    {
        $application = ZoningApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $document->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Document approved successfully.');
    }

    /**
     * Reject a zoning document.
     */
    public function rejectDocument(Request $request, string $id, string $documentId)
    {
        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:1000'],
        ]);

        $application = ZoningApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $document->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'notes' => $validated['notes'],
        ]);

        return back()->with('success', 'Document rejected successfully.');
    }

    /**
     * Get version history for a document.
     */
    public function getDocumentVersions(string $id, string $documentId)
    {
        $application = ZoningApplication::findOrFail($id);
        $document = $application->documents()->findOrFail($documentId);

        $parentId = $document->parent_document_id ?: $document->id;
        $versions = ZoningApplicationDocument::where(function ($q) use ($parentId) {
            $q->where('id', $parentId)
                ->orWhere('parent_document_id', $parentId);
        })
            ->orderBy('version', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'version' => $doc->version,
                    'fileName' => $doc->file_name,
                    'fileSize' => $doc->file_size,
                    'status' => $doc->status,
                    'url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
                    'mimeType' => $doc->mime_type,
                    'isCurrent' => (bool) $doc->is_current,
                    'reviewedAt' => $doc->reviewed_at?->format('Y-m-d H:i:s'),
                    'notes' => $doc->notes,
                    'createdAt' => $doc->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'documentType' => $document->document_type,
            'versions' => $versions,
        ]);
    }
}
