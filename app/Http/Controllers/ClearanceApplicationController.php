<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClearanceApplicationRequest;
use App\Models\ApplicationHistory;
use App\Models\ClearanceApplication;
use App\Models\ExternalVerification;
use App\Services\PermitLicensingService;
use App\Services\TreasuryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceApplicationController extends Controller
{
    public function __construct(
        protected TreasuryService $treasuryService,
        protected PermitLicensingService $permitLicensingService
    ) {}

    /**
     * Display a listing of the user's clearance applications.
     */
    public function index(Request $request): Response
    {
        $query = ClearanceApplication::where('user_id', Auth::id());

        // Filter by category if provided
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'applicationNumber' => $application->reference_no,
                    'projectType' => str_replace('_', ' ', ucfirst($application->project_type)),
                    'status' => $application->status,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'municipality' => $application->municipality,
                    'barangay' => $application->barangay,
                    'lotAddress' => $application->lot_address,
                    'zoneName' => $application->zone?->name,
                ];
            });

        return Inertia::render('Applications/ApplicationsIndex', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show the clearance application form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', ClearanceApplication::class);

        $category = $request->query('category');

        return Inertia::render('Applications/ClearanceApplication', [
            'category' => $category,
        ]);
    }

    /**
     * Store a newly created clearance application.
     */
    public function store(StoreClearanceApplicationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $referenceNo = null;

        DB::connection('zcs_db')->transaction(function () use ($validated, &$referenceNo) {
            // Generate reference number
            $referenceNo = ClearanceApplication::generateReferenceNo();

            // Handle address: if structured fields are provided, concatenate them
            $lotAddress = $validated['lot_address'];
            if (! empty($validated['province']) || ! empty($validated['municipality']) || ! empty($validated['barangay']) || ! empty($validated['street_name'])) {
                $addressParts = array_filter([
                    $validated['street_name'] ?? null,
                    $validated['barangay'] ?? null,
                    $validated['municipality'] ?? null,
                    $validated['province'] ?? null,
                ]);
                if (! empty($addressParts)) {
                    $structuredAddress = implode(', ', $addressParts);
                    // Append to lot_address if it exists, otherwise use structured address
                    $lotAddress = ! empty($lotAddress) ? $lotAddress.', '.$structuredAddress : $structuredAddress;
                }
            }

            // Create application
            $application = ClearanceApplication::create([
                'reference_no' => $referenceNo,
                'user_id' => Auth::id(),
                'zone_id' => $validated['zone_id'],
                'application_category' => $validated['application_category'],
                'applicant_type' => $validated['applicant_type'],
                'contact_number' => $validated['contact_number'],
                'contact_email' => $validated['contact_email'] ?? null,
                'tax_dec_ref_no' => $validated['tax_dec_ref_no'],
                'barangay_permit_ref_no' => $validated['barangay_permit_ref_no'],
                'pin_lat' => $validated['pin_lat'],
                'pin_lng' => $validated['pin_lng'],
                'lot_address' => $lotAddress,
                'province' => $validated['province'] ?? null,
                'municipality' => $validated['municipality'] ?? null,
                'barangay' => $validated['barangay'] ?? null,
                'street_name' => $validated['street_name'] ?? null,
                'lot_owner' => $validated['lot_owner'],
                'lot_area_total' => $validated['lot_area_total'],
                'is_subdivision' => $validated['is_subdivision'],
                'subdivision_name' => $validated['subdivision_name'] ?? null,
                'block_no' => $validated['block_no'] ?? null,
                'lot_no' => $validated['lot_no'] ?? null,
                'total_lots_planned' => $validated['total_lots_planned'] ?? null,
                'has_subdivision_plan' => $validated['has_subdivision_plan'] ?? false,
                'land_use_type' => $validated['land_use_type'],
                'project_type' => $validated['project_type'],
                'building_type' => $validated['building_type'] ?? null,
                'project_description' => $validated['project_description'],
                'existing_structure' => $validated['existing_structure'],
                'number_of_storeys' => $validated['number_of_storeys'] ?? null,
                'floor_area_sqm' => $validated['floor_area_sqm'] ?? null,
                'purpose' => $validated['purpose'],
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Prerequisites should already be verified before submission (Phase 0)
            // But we still log the verification for audit trail
            $taxDecVerification = $this->treasuryService->verifyTaxDeclaration($validated['tax_dec_ref_no']);
            ExternalVerification::create([
                'application_id' => $application->id,
                'verification_type' => 'tax_declaration',
                'reference_no' => $validated['tax_dec_ref_no'],
                'status' => $taxDecVerification['verified'] ? 'verified' : 'failed',
                'response_data' => $taxDecVerification['data'],
                'external_system' => 'Treasury',
                'verified_at' => $taxDecVerification['verified'] ? now() : null,
            ]);

            $barangayPermitVerification = $this->permitLicensingService->verifyBarangayPermit($validated['barangay_permit_ref_no']);
            ExternalVerification::create([
                'application_id' => $application->id,
                'verification_type' => 'barangay_permit',
                'reference_no' => $validated['barangay_permit_ref_no'],
                'status' => $barangayPermitVerification['verified'] ? 'verified' : 'failed',
                'response_data' => $barangayPermitVerification['data'],
                'external_system' => 'Permit & Licensing',
                'verified_at' => $barangayPermitVerification['verified'] ? now() : null,
            ]);

            // Create initial history record
            ApplicationHistory::create([
                'application_id' => $application->id,
                'status' => 'pending',
                'remarks' => 'Application submitted',
                'updated_by' => Auth::id(),
                'updated_at' => now(),
            ]);
        });

        return redirect()->route('clearance-applications.index')
            ->with('success', 'Application submitted successfully. Reference Number: '.$referenceNo);
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
            'inspection',
            'issuedClearance',
        ])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('view', $application);

        return Inertia::render('Applications/ClearanceApplicationDetails', [
            'application' => [
                'id' => $application->id,
                'reference_no' => $application->reference_no,
                'application_category' => $application->application_category,
                'status' => $application->status,
                'denial_reason' => $application->denial_reason,
                'assessed_fee' => $application->assessed_fee,
                'applicant_type' => $application->applicant_type,
                'contact_number' => $application->contact_number,
                'contact_email' => $application->contact_email,
                'tax_dec_ref_no' => $application->tax_dec_ref_no,
                'barangay_permit_ref_no' => $application->barangay_permit_ref_no,
                'pin_lat' => $application->pin_lat !== null ? (float) $application->pin_lat : null,
                'pin_lng' => $application->pin_lng !== null ? (float) $application->pin_lng : null,
                'lot_address' => $application->lot_address,
                'province' => $application->province,
                'municipality' => $application->municipality,
                'barangay' => $application->barangay,
                'street_name' => $application->street_name,
                'lot_owner' => $application->lot_owner,
                'lot_area_total' => $application->lot_area_total,
                'is_subdivision' => $application->is_subdivision,
                'subdivision_name' => $application->subdivision_name,
                'block_no' => $application->block_no,
                'lot_no' => $application->lot_no,
                'land_use_type' => $application->land_use_type,
                'project_type' => $application->project_type,
                'building_type' => $application->building_type,
                'project_description' => $application->project_description,
                'purpose' => $application->purpose,
                'documents' => $application->documents->map(fn ($doc) => [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'file_path' => $doc->file_path,
                    'file_type' => $doc->file_type,
                    'file_size' => $doc->file_size,
                    'uploaded_at' => $doc->uploaded_at?->format('Y-m-d H:i:s'),
                ]),
                'externalVerifications' => $application->externalVerifications->map(fn ($v) => [
                    'id' => $v->id,
                    'verification_type' => $v->verification_type,
                    'reference_no' => $v->reference_no,
                    'status' => $v->status,
                    'response_data' => $v->response_data,
                    'external_system' => $v->external_system,
                    'verified_at' => $v->verified_at?->format('Y-m-d H:i:s'),
                ]),
                'history' => $application->history->map(fn ($h) => [
                    'id' => $h->id,
                    'status' => $h->status,
                    'remarks' => $h->remarks,
                    'updated_by' => $h->updated_by,
                    'updated_at' => $h->updated_at->format('Y-m-d H:i:s'),
                ]),
                'submitted_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'created_at' => $application->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
