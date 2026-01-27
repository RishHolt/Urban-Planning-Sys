<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInspectionRequest;
use App\Models\Inspection;
use App\Models\InspectionChecklistItem;
use App\Models\InspectionDocument;
use App\Models\User;
use App\Models\ZoningInspectionPhoto;
use App\Services\InspectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InspectionController extends Controller
{
    public function __construct(
        protected InspectionService $inspectionService
    ) {}

    /**
     * Display a listing of inspections for the inspector.
     */
    public function index(Request $request): Response
    {
        $query = Inspection::with(['clearanceApplication', 'checklistItems', 'photos', 'documents']);

        // Filter by inspector if not admin/staff
        if (! in_array(Auth::user()->role, ['admin', 'staff'])) {
            $query->where('inspector_id', Auth::id());
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('inspection_status', $request->status);
        }

        $inspections = $query->orderBy('scheduled_date', 'asc')->get();

        // Get inspectors list and applications ready for inspection (for admin/staff)
        $inspectors = [];
        $applications = [];
        if (in_array(Auth::user()->role, ['admin', 'staff'])) {
            $inspectors = User::with('profile')
                ->where(function ($query) {
                    $query->where('role', 'inspector')
                        ->orWhere('role', 'admin');
                })
                ->get()
                ->map(function ($user) {
                    $fullName = $user->profile
                        ? trim(($user->profile->first_name ?? '').' '.($user->profile->middle_name ?? '').' '.($user->profile->last_name ?? '').' '.($user->profile->suffix ?? ''))
                        : null;

                    return [
                        'id' => $user->id,
                        'name' => $fullName ?: $user->email,
                        'email' => $user->email,
                    ];
                })
                ->values();

            // Get applications that are ready for inspection
            // Priority: 'for_inspection' status (explicitly marked for inspection by admin)
            // Also include 'under_review' status (may be ready to move to inspection phase)
            $applications = \App\Models\ZoningApplication::whereIn('status', ['for_inspection', 'under_review'])
                ->whereDoesntHave('inspection') // Don't show applications that already have an inspection scheduled
                ->select('id', 'reference_no', 'application_number', 'lot_address', 'lot_owner', 'applicant_name', 'status')
                ->orderByRaw("CASE WHEN status = 'for_inspection' THEN 0 ELSE 1 END") // Prioritize 'for_inspection' status
                ->orderBy('created_at', 'desc')
                ->limit(100) // Limit to prevent too many options
                ->get()
                ->map(function ($app) {
                    return [
                        'id' => $app->id,
                        'reference_no' => $app->reference_no ?? $app->application_number ?? 'N/A',
                        'lot_address' => $app->lot_address ?? 'N/A',
                        'lot_owner' => $app->lot_owner ?? $app->applicant_name ?? 'N/A',
                        'status' => $app->status,
                        // Create a short display label
                        'display_label' => ($app->reference_no ?? $app->application_number ?? 'N/A').' - '.($app->lot_owner ?? $app->applicant_name ?? 'N/A'),
                    ];
                });
        }

        return Inertia::render('Inspections/InspectionsIndex', [
            'inspections' => $inspections,
            'inspectors' => $inspectors,
            'applications' => $applications,
        ]);
    }

    /**
     * Show a specific inspection with full details.
     */
    public function show(string $id): Response
    {
        $inspection = Inspection::with([
            'clearanceApplication',
            'inspector.profile',
            'checklistItems',
            'photos.uploadedBy.profile',
            'documents.uploadedBy.profile',
            'reviewer.profile',
        ])->findOrFail($id);

        return Inertia::render('Inspections/InspectionShow', [
            'inspection' => $inspection,
        ]);
    }

    /**
     * Store a newly scheduled inspection.
     */
    public function store(StoreInspectionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->inspectionService->scheduleInspection(
            $validated['application_id'],
            $validated['inspector_id'],
            $validated['scheduled_date'],
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Inspection scheduled successfully. Inspector and applicant have been notified.');
    }

    /**
     * Update inspection findings and result.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $inspection = Inspection::findOrFail($id);

        $validated = $request->validate([
            'findings' => ['nullable', 'string'],
            'recommendations' => ['nullable', 'string'],
            'result' => ['required', 'in:passed,failed'],
        ]);

        $this->inspectionService->completeInspection(
            $inspection,
            $validated['result'],
            $validated['findings'] ?? null,
            $validated['recommendations'] ?? null
        );

        return back()->with('success', 'Inspection results recorded.');
    }

    /**
     * Update checklist item compliance status.
     */
    public function updateChecklistItem(Request $request, string $inspectionId, string $itemId): JsonResponse
    {
        $inspection = Inspection::findOrFail($inspectionId);

        $validated = $request->validate([
            'compliance_status' => ['required', 'in:compliant,non_compliant,not_applicable,pending'],
            'notes' => ['nullable', 'string'],
        ]);

        $item = InspectionChecklistItem::where('inspection_id', $inspectionId)
            ->findOrFail($itemId);

        $item->update($validated);

        return response()->json(['success' => true, 'item' => $item]);
    }

    /**
     * Add checklist item to inspection.
     */
    public function addChecklistItem(Request $request, string $id): RedirectResponse
    {
        $inspection = Inspection::findOrFail($id);

        $validated = $request->validate([
            'item_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        InspectionChecklistItem::create([
            'inspection_id' => $inspection->id,
            'item_name' => $validated['item_name'],
            'description' => $validated['description'] ?? null,
            'compliance_status' => 'pending',
        ]);

        return back()->with('success', 'Checklist item added.');
    }

    /**
     * Upload photo for inspection.
     */
    public function uploadPhoto(Request $request, string $id): RedirectResponse
    {
        $inspection = Inspection::findOrFail($id);

        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:5120'], // 5MB max
            'photo_description' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('photo');
        $path = $file->store("inspections/{$inspection->id}/photos", 'public');

        ZoningInspectionPhoto::create([
            'inspection_id' => $inspection->id,
            'photo_path' => $path,
            'photo_description' => $validated['photo_description'] ?? null,
            'uploaded_by' => Auth::id(),
            'taken_at' => now(),
        ]);

        return back()->with('success', 'Photo uploaded successfully.');
    }

    /**
     * Upload document for inspection.
     */
    public function uploadDocument(Request $request, string $id): RedirectResponse
    {
        $inspection = Inspection::findOrFail($id);

        $validated = $request->validate([
            'document' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'], // 10MB max
            'document_type' => ['required', 'string'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('document');
        $path = $file->store("inspections/{$inspection->id}/documents", 'public');

        InspectionDocument::create([
            'inspection_id' => $inspection->id,
            'document_type' => $validated['document_type'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'description' => $validated['description'] ?? null,
            'uploaded_by' => Auth::id(),
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    /**
     * Generate inspection report.
     */
    public function generateReport(string $id): JsonResponse
    {
        $inspection = Inspection::with([
            'clearanceApplication',
            'inspector.profile',
            'checklistItems',
            'photos',
            'documents',
        ])->findOrFail($id);

        $inspectorName = 'N/A';
        if ($inspection->inspector) {
            $profile = $inspection->inspector->profile;
            if ($profile) {
                $inspectorName = trim(($profile->first_name ?? '').' '.($profile->middle_name ?? '').' '.($profile->last_name ?? '').' '.($profile->suffix ?? '')) ?: $inspection->inspector->email;
            } else {
                $inspectorName = $inspection->inspector->email;
            }
        }

        $report = [
            'inspection_id' => $inspection->id,
            'application_reference' => $inspection->clearanceApplication->reference_no,
            'scheduled_date' => $inspection->scheduled_date->format('Y-m-d'),
            'inspected_at' => $inspection->inspected_at?->format('Y-m-d H:i:s'),
            'inspector' => $inspectorName,
            'result' => $inspection->result,
            'status' => $inspection->inspection_status,
            'findings' => $inspection->findings,
            'recommendations' => $inspection->recommendations,
            'checklist_summary' => [
                'total_items' => $inspection->checklistItems->count(),
                'compliant' => $inspection->checklistItems->where('compliance_status', 'compliant')->count(),
                'non_compliant' => $inspection->checklistItems->where('compliance_status', 'non_compliant')->count(),
                'pending' => $inspection->checklistItems->where('compliance_status', 'pending')->count(),
            ],
            'photos_count' => $inspection->photos->count(),
            'documents_count' => $inspection->documents->count(),
            'checklist_items' => $inspection->checklistItems->map(function ($item) {
                return [
                    'item_name' => $item->item_name,
                    'description' => $item->description,
                    'compliance_status' => $item->compliance_status,
                    'notes' => $item->notes,
                ];
            }),
        ];

        return response()->json($report);
    }

    /**
     * Review inspection (admin/staff only).
     */
    public function review(Request $request, string $id): RedirectResponse
    {
        if (! in_array(Auth::user()->role, ['admin', 'staff'])) {
            abort(403);
        }

        $inspection = Inspection::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => ['required', 'string'],
        ]);

        $this->inspectionService->reviewInspection($inspection, $validated['review_notes']);

        return back()->with('success', 'Inspection reviewed successfully.');
    }
}
