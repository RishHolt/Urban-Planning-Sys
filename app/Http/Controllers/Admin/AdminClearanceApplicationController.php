<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApplicationHistory;
use App\Models\ClearanceApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminClearanceApplicationController extends Controller
{
    /**
     * Display a listing of all clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = ClearanceApplication::with('zone');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                    ->orWhere('lot_owner', 'like', "%{$search}%")
                    ->orWhere('lot_address', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->byStatus($request->status);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'referenceNo' => $application->reference_no,
                    'category' => $application->application_category,
                    'status' => $application->status,
                    'lotOwner' => $application->lot_owner,
                    'lotAddress' => $application->lot_address,
                    'zoneName' => $application->zone?->name,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Clearance/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'category' => $request->category,
            ],
        ]);
    }

    /**
     * Display the specified clearance application.
     */
    public function show(string $id): Response
    {
        $application = ClearanceApplication::with([
            'zone',
            'documents',
            'history',
            'externalVerifications',
            'paymentRecord',
            'inspection',
            'issuedClearance',
        ])->findOrFail($id);

        return Inertia::render('Admin/Clearance/ApplicationDetails', [
            'application' => [
                // Basic Info
                'id' => $application->id,
                'reference_no' => $application->reference_no,
                'application_category' => $application->application_category,
                'status' => $application->status,
                'denial_reason' => $application->denial_reason,
                'assessed_fee' => $application->assessed_fee,

                // Applicant Info
                'applicant_type' => $application->applicant_type,
                'contact_number' => $application->contact_number,
                'contact_email' => $application->contact_email,

                // Prerequisites (API Verified)
                'tax_dec_ref_no' => $application->tax_dec_ref_no,
                'barangay_permit_ref_no' => $application->barangay_permit_ref_no,
                'externalVerifications' => $application->externalVerifications->map(fn ($v) => [
                    'id' => $v->id,
                    'verification_type' => $v->verification_type,
                    'reference_no' => $v->reference_no,
                    'status' => $v->status,
                    'external_system' => $v->external_system,
                    'verified_at' => $v->verified_at?->format('Y-m-d H:i:s'),
                ]),

                // Location (Pin)
                'pin_lat' => $application->pin_lat,
                'pin_lng' => $application->pin_lng,
                'zone' => $application->zone ? [
                    'id' => $application->zone->id,
                    'name' => $application->zone->name,
                    'code' => $application->zone->code,
                    'geometry' => $application->zone->geometry,
                    'color' => $application->zone->color,
                ] : null,

                // Property Info
                'lot_address' => $application->lot_address,
                'province' => $application->province,
                'municipality' => $application->municipality,
                'barangay' => $application->barangay,
                'street_name' => $application->street_name,
                'lot_owner' => $application->lot_owner,
                'lot_area_total' => $application->lot_area_total,

                // Subdivision Info
                'is_subdivision' => $application->is_subdivision,
                'subdivision_name' => $application->subdivision_name,
                'block_no' => $application->block_no,
                'lot_no' => $application->lot_no,
                'total_lots_planned' => $application->total_lots_planned,
                'has_subdivision_plan' => $application->has_subdivision_plan,

                // Project Details
                'land_use_type' => $application->land_use_type,
                'project_type' => $application->project_type,
                'building_type' => $application->building_type,
                'project_description' => $application->project_description,
                'existing_structure' => $application->existing_structure,
                'number_of_storeys' => $application->number_of_storeys,
                'floor_area_sqm' => $application->floor_area_sqm,
                'estimated_cost' => $application->estimated_cost,
                'purpose' => $application->purpose,

                // Related Data
                'documents' => $application->documents->map(fn ($doc) => [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'file_path' => $doc->file_path,
                    'file_type' => $doc->file_type,
                    'file_size' => $doc->file_size,
                    'uploaded_at' => $doc->uploaded_at?->format('Y-m-d H:i:s'),
                ]),
                'history' => $application->history->map(fn ($h) => [
                    'id' => $h->id,
                    'status' => $h->status,
                    'remarks' => $h->remarks,
                    'updated_by' => $h->updated_by,
                    'updated_at' => $h->updated_at->format('Y-m-d H:i:s'),
                ]),
                'paymentRecord' => $application->paymentRecord ? [
                    'or_number' => $application->paymentRecord->or_number,
                    'amount' => $application->paymentRecord->amount,
                    'payment_date' => $application->paymentRecord->payment_date->format('Y-m-d'),
                    'treasury_ref' => $application->paymentRecord->treasury_ref,
                    'recorded_by' => $application->paymentRecord->recorded_by,
                ] : null,
                'inspection' => $application->inspection ? [
                    'id' => $application->inspection->id,
                    'inspector_id' => $application->inspection->inspector_id,
                    'scheduled_date' => $application->inspection->scheduled_date->format('Y-m-d'),
                    'findings' => $application->inspection->findings,
                    'result' => $application->inspection->result,
                    'inspected_at' => $application->inspection->inspected_at?->format('Y-m-d H:i:s'),
                ] : null,
                'issuedClearance' => $application->issuedClearance ? [
                    'id' => $application->issuedClearance->id,
                    'clearance_no' => $application->issuedClearance->clearance_no,
                    'issue_date' => $application->issuedClearance->issue_date->format('Y-m-d'),
                    'valid_until' => $application->issuedClearance->valid_until?->format('Y-m-d'),
                    'conditions' => $application->issuedClearance->conditions,
                    'status' => $application->issuedClearance->status,
                ] : null,

                // System
                'submitted_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'processed_at' => $application->processed_at?->format('Y-m-d H:i:s'),
                'created_at' => $application->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Update application status following workflow.
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,under_review,for_inspection,approved,denied'],
            'remarks' => ['nullable', 'string'],
            'denial_reason' => ['nullable', 'string', 'required_if:status,denied'],
        ]);

        $application = ClearanceApplication::findOrFail($id);
        $currentStatus = $application->status;
        $newStatus = $validated['status'];

        // Validate status transition according to workflow
        $validTransitions = [
            'pending' => ['under_review', 'denied'],
            'under_review' => ['for_inspection', 'denied', 'pending'], // pending = request more documents
            'for_inspection' => ['approved', 'denied'],
            'approved' => [], // Final state
            'denied' => [], // Final state
        ];

        if (! in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return back()->withErrors([
                'status' => "Invalid status transition from '{$currentStatus}' to '{$newStatus}'. Valid transitions: ".implode(', ', $validTransitions[$currentStatus] ?? []),
            ]);
        }

        $application->update([
            'status' => $newStatus,
            'denial_reason' => $validated['denial_reason'] ?? null,
            'processed_at' => in_array($newStatus, ['approved', 'denied']) ? now() : null,
        ]);

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => $newStatus,
            'remarks' => $validated['remarks'] ?? $this->getDefaultRemarks($currentStatus, $newStatus),
            'updated_by' => auth()->id(),
            'updated_at' => now(),
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

        $application = ClearanceApplication::findOrFail($id);

        // Only allow document requests for pending or under_review applications
        if (! in_array($application->status, ['pending', 'under_review'])) {
            return back()->withErrors([
                'status' => 'Document requests can only be made for pending or under review applications.',
            ]);
        }

        // Set status back to pending if it was under_review (workflow: D3 -> B7)
        if ($application->status === 'under_review') {
            $application->update(['status' => 'pending']);
        }

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => 'pending',
            'remarks' => 'Additional documents requested: '.$validated['message'],
            'updated_by' => auth()->id(),
            'updated_at' => now(),
        ]);

        // TODO: Send notification to applicant

        return back()->with('success', 'Document request sent to applicant.');
    }

    /**
     * Get default remarks for status transition.
     */
    private function getDefaultRemarks(string $fromStatus, string $toStatus): string
    {
        $remarks = [
            'pending' => [
                'under_review' => 'Application moved to review',
                'denied' => 'Application denied',
            ],
            'under_review' => [
                'for_inspection' => 'Application approved for inspection',
                'denied' => 'Application denied during review',
                'pending' => 'Returned to applicant for additional documents',
            ],
            'for_inspection' => [
                'approved' => 'Application approved after inspection',
                'denied' => 'Application denied after inspection',
            ],
        ];

        return $remarks[$fromStatus][$toStatus] ?? 'Status updated';
    }
}
