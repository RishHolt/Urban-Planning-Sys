<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreZoningApplicationRequest;
use App\Models\ZoningApplication;
use App\Models\ZoningApplicationDocument;
use App\Models\ZoningApplicationStatusHistory;
use App\Services\ZoningApplicationLabelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ZoningApplicationController extends Controller
{
    /**
     * Display a listing of the user's zoning applications.
     */
    public function index(Request $request): Response
    {
        $applications = ZoningApplication::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'applicationNumber' => $application->application_number,
                    'projectType' => ZoningApplicationLabelService::getApplicationTypeLabel($application->application_type),
                    'status' => $application->status,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'municipality' => $application->municipality,
                    'barangay' => $application->barangay,
                ];
            });

        return Inertia::render('Applications/ApplicationsIndex', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show the zoning application form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', ZoningApplication::class);

        $serviceId = $request->query('service', 'zoning-clearance');

        return Inertia::render('Applications/ZoningApplication', [
            'serviceId' => $serviceId,
        ]);
    }

    /**
     * Display the specified zoning application.
     */
    public function show(string $id): Response
    {
        $application = ZoningApplication::with(['documents', 'statusHistory'])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('view', $application);

        // Format documents with URLs - only show current versions
        $documents = $application->documents()
            ->where('is_current', true)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'documentType' => $doc->document_type,
                    'type' => $doc->type, // 'upload' or 'manual'
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

        // Format Valid ID path to URL (only document that stays in main table)
        $applicationData = $application->toArray();
        if (! empty($applicationData['valid_id_path'])) {
            $applicationData['valid_id_path_url'] = asset('storage/'.$applicationData['valid_id_path']);
        }

        return Inertia::render('Applications/ApplicationDetails', [
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
     * Store the zoning application.
     */
    public function store(StoreZoningApplicationRequest $request): RedirectResponse
    {
        $this->authorize('create', ZoningApplication::class);

        try {
            DB::connection('zcs_db')->beginTransaction();

            $validated = $request->validated();
            $userId = Auth::id();

            // Generate application number
            $applicationNumber = ZoningApplication::generateApplicationNumber();

            // Store files and get paths
            $filePaths = $this->storeFiles($request, $userId, $applicationNumber);

            // Prepare application data (only Valid ID stays in main table)
            $applicationData = [
                'user_id' => $userId,
                'application_number' => $applicationNumber,
                'service_id' => $request->input('serviceId', 'zoning-clearance'),
                'status' => 'pending',
                'submitted_at' => now(),
                'applicant_type' => $validated['applicantType'],
                'applicant_name' => $validated['applicantName'] ?? $validated['companyName'],
                'applicant_email' => $validated['applicantEmail'],
                'applicant_contact' => $validated['applicantContact'],
                'valid_id_path' => $filePaths['validId'] ?? null, // Only Valid ID stays in main table
                'company_name' => $validated['companyName'] ?? null,
                'sec_dti_reg_no' => $validated['secDtiRegNo'] ?? null,
                'authorized_representative' => $validated['authorizedRepresentative'] ?? null,
                'is_property_owner' => $validated['isPropertyOwner'],
                'owner_name' => $validated['ownerName'] ?? null,
                'owner_address' => $validated['ownerAddress'] ?? null,
                'owner_contact' => $validated['ownerContact'] ?? null,
                'province' => $validated['province'],
                'municipality' => $validated['municipality'],
                'barangay' => $validated['barangay'],
                'lot_no' => $validated['lotNo'] ?? null,
                'block_no' => $validated['blockNo'] ?? null,
                'street_name' => $validated['streetName'] ?? null,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'land_type' => $validated['landType'],
                'has_existing_structure' => $validated['hasExistingStructure'],
                'number_of_buildings' => $validated['numberOfBuildings'] ?? null,
                'lot_area' => $validated['lotArea'],
                'application_type' => $validated['applicationType'],
                'proposed_use' => $validated['proposedUse'],
                'project_description' => $validated['projectDescription'] ?? null,
                'previous_use' => $validated['previousUse'] ?? null,
                'justification' => $validated['justification'] ?? null,
                'declaration_truthfulness' => $validated['declarationOfTruthfulness'],
                'agreement_compliance' => $validated['agreementToComply'],
                'data_privacy_consent' => $validated['dataPrivacyConsent'],
                'application_date' => $validated['applicationDate'],
            ];

            // Create application
            $application = ZoningApplication::create($applicationData);

            // Store all documents in documents table (except Valid ID)
            $this->storeAllDocuments($application, $request, $filePaths, $validated);

            // Create initial status history entry
            ZoningApplicationStatusHistory::create([
                'zoning_application_id' => $application->id,
                'status_from' => null,
                'status_to' => 'pending',
                'changed_by' => $userId,
                'notes' => 'Application submitted',
                'created_at' => now(),
            ]);

            DB::connection('zcs_db')->commit();

            return redirect()->route('applications.zoning.success', [
                'applicationNumber' => $applicationNumber,
            ]);
        } catch (\Exception $e) {
            DB::connection('zcs_db')->rollBack();

            // Clean up uploaded files on error
            if (isset($filePaths)) {
                $this->cleanupFiles($filePaths);
            }

            // Log the actual error for debugging
            Log::error('Zoning application submission error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);

            $errorMessage = config('app.debug')
                ? 'An error occurred: '.$e->getMessage()
                : 'An error occurred while submitting your application. Please try again.';

            return back()->withErrors([
                'error' => $errorMessage,
            ])->withInput();
        }
    }

    /**
     * Store all uploaded files and return their paths.
     *
     * @return array<string, string|null>
     */
    private function storeFiles(StoreZoningApplicationRequest $request, int $userId, string $applicationNumber): array
    {
        $filePaths = [];
        $basePath = "zoning-applications/{$userId}/{$applicationNumber}";

        // Single file uploads
        $singleFileFields = [
            'validId',
            'authorizationLetter',
            'proofOfOwnership',
            'taxDeclaration',
            'siteDevelopmentPlan',
            'locationMap',
            'vicinityMap',
            'barangayClearance',
            'letterOfIntent',
            'proofOfLegalAuthority',
            'endorsementsApprovals',
            'environmentalCompliance',
            'signature',
        ];

        foreach ($singleFileFields as $field) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $fileName = $this->generateFileName($file, $field);
                $path = $file->storeAs($basePath, $fileName, 'public');
                $filePaths[$field] = $path;
            }
        }

        return $filePaths;
    }

    /**
     * Store all documents in documents table (except Valid ID which stays in main table).
     */
    private function storeAllDocuments(
        ZoningApplication $application,
        StoreZoningApplicationRequest $request,
        array $filePaths,
        array $validated
    ): void {
        $basePath = "zoning-applications/{$application->user_id}/{$application->application_number}";

        // Authorization Letter
        if (isset($filePaths['authorizationLetter'])) {
            $file = $request->file('authorizationLetter');
            ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => 'authorization_letter',
                'type' => 'upload',
                'file_path' => $filePaths['authorizationLetter'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'version' => 1,
                'is_current' => true,
            ]);
        }

        // Proof of Ownership (TCT) - Only for non-Government applicants
        if ($validated['applicantType'] !== 'Government' && isset($filePaths['proofOfOwnership'])) {
            $file = $request->file('proofOfOwnership');
            ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => 'proof_of_ownership',
                'type' => 'upload',
                'file_path' => $filePaths['proofOfOwnership'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'version' => 1,
                'is_current' => true,
            ]);
        }

        // Tax Declaration - Only for non-Government applicants
        if ($validated['applicantType'] !== 'Government') {
            if (isset($validated['taxDeclarationType']) && $validated['taxDeclarationType'] === 'upload' && isset($filePaths['taxDeclaration'])) {
                $file = $request->file('taxDeclaration');
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'tax_declaration',
                    'type' => 'upload',
                    'file_path' => $filePaths['taxDeclaration'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            } elseif (isset($validated['taxDeclarationType']) && $validated['taxDeclarationType'] === 'manual' && ! empty($validated['taxDeclarationId'])) {
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'tax_declaration',
                    'type' => 'manual',
                    'manual_id' => $validated['taxDeclarationId'],
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }
        }

        // Site Development Plan
        if (isset($filePaths['siteDevelopmentPlan'])) {
            $file = $request->file('siteDevelopmentPlan');
            ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => 'site_development_plan',
                'type' => 'upload',
                'file_path' => $filePaths['siteDevelopmentPlan'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'version' => 1,
                'is_current' => true,
            ]);
        }

        // Location Map
        if (isset($filePaths['locationMap'])) {
            $file = $request->file('locationMap');
            ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => 'location_map',
                'type' => 'upload',
                'file_path' => $filePaths['locationMap'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'version' => 1,
                'is_current' => true,
            ]);
        }

        // Vicinity Map
        if (isset($filePaths['vicinityMap'])) {
            $file = $request->file('vicinityMap');
            ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => 'vicinity_map',
                'type' => 'upload',
                'file_path' => $filePaths['vicinityMap'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'version' => 1,
                'is_current' => true,
            ]);
        }

        // Barangay Clearance (only for non-Government applicants)
        if ($validated['applicantType'] !== 'Government') {
            if ($validated['barangayClearanceType'] === 'upload' && isset($filePaths['barangayClearance'])) {
                $file = $request->file('barangayClearance');
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'barangay_clearance',
                    'type' => 'upload',
                    'file_path' => $filePaths['barangayClearance'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            } elseif ($validated['barangayClearanceType'] === 'manual' && ! empty($validated['barangayClearanceId'])) {
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'barangay_clearance',
                    'type' => 'manual',
                    'manual_id' => $validated['barangayClearanceId'],
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }
        }

        // Government-specific documents
        if ($validated['applicantType'] === 'Government') {
            // Letter of Intent
            if (isset($filePaths['letterOfIntent'])) {
                $file = $request->file('letterOfIntent');
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'letter_of_intent',
                    'type' => 'upload',
                    'file_path' => $filePaths['letterOfIntent'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }

            // Proof of Legal Authority
            if (isset($filePaths['proofOfLegalAuthority'])) {
                $file = $request->file('proofOfLegalAuthority');
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'proof_of_legal_authority',
                    'type' => 'upload',
                    'file_path' => $filePaths['proofOfLegalAuthority'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }

            // Endorsements / Approvals
            if (isset($filePaths['endorsementsApprovals'])) {
                $file = $request->file('endorsementsApprovals');
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'endorsements_approvals',
                    'type' => 'upload',
                    'file_path' => $filePaths['endorsementsApprovals'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }

            // Environmental Compliance Certificate (optional)
            if (isset($filePaths['environmentalCompliance'])) {
                $file = $request->file('environmentalCompliance');
                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'environmental_compliance',
                    'type' => 'upload',
                    'file_path' => $filePaths['environmentalCompliance'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }
        }

        // Digital Signature
        if (isset($filePaths['signature'])) {
            $file = $request->file('signature');
            ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => 'signature',
                'type' => 'upload',
                'file_path' => $filePaths['signature'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'version' => 1,
                'is_current' => true,
            ]);
        }

        // Existing Building Photos
        if ($request->hasFile('existingBuildingPhotos')) {
            foreach ($request->file('existingBuildingPhotos') as $file) {
                $fileName = $this->generateFileName($file, 'existing_building_photo');
                $path = $file->storeAs($basePath, $fileName, 'public');

                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'existing_building_photos',
                    'type' => 'upload',
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }
        }

        // Other Documents
        if ($request->hasFile('otherDocuments')) {
            foreach ($request->file('otherDocuments') as $file) {
                $fileName = $this->generateFileName($file, 'other_document');
                $path = $file->storeAs($basePath, $fileName, 'public');

                ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'other_documents',
                    'type' => 'upload',
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => 1,
                    'is_current' => true,
                ]);
            }
        }
    }

    /**
     * Upload additional requested documents for an existing application.
     */
    public function uploadDocuments(Request $request, string $id): RedirectResponse
    {
        $application = ZoningApplication::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('uploadDocuments', $application);

        // Validate request
        $request->validate([
            'requestedDocuments' => ['required', 'array', 'min:1'],
            'requestedDocuments.*' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
        ]);

        try {
            $basePath = "zoning-applications/{$application->user_id}/{$application->application_number}";
            $uploadedFiles = [];

            // Store each uploaded file
            foreach ($request->file('requestedDocuments') as $file) {
                $fileName = $this->generateFileName($file, 'requested_document');
                $path = $file->storeAs($basePath, $fileName, 'public');

                // Get the highest version number for requested_documents type
                $maxVersion = $application->documents()
                    ->where('document_type', 'requested_documents')
                    ->max('version') ?? 0;

                $uploadedFiles[] = ZoningApplicationDocument::create([
                    'zoning_application_id' => $application->id,
                    'document_type' => 'requested_documents',
                    'type' => 'upload',
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                    'version' => $maxVersion + 1,
                    'is_current' => true,
                ]);
            }

            // Create status history entry for uploaded documents
            $documentTypeName = $this->getDocumentTypeName('requested_documents');

            // Create individual status history entries for each uploaded document with version info
            foreach ($uploadedFiles as $uploadedDoc) {
                $notes = "Document '{$documentTypeName}' uploaded (Version {$uploadedDoc->version})";

                ZoningApplicationStatusHistory::create([
                    'zoning_application_id' => $application->id,
                    'status_from' => $application->status,
                    'status_to' => $application->status, // Keep application status the same
                    'changed_by' => Auth::id(),
                    'notes' => $notes,
                    'created_at' => now(),
                ]);
            }

            return back()->with('success', 'Documents uploaded successfully.');
        } catch (\Exception $e) {
            Log::error('Document upload error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'application_id' => $id,
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while uploading documents. Please try again.',
            ]);
        }
    }

    /**
     * Replace a rejected document with a new version.
     */
    public function replaceDocument(Request $request, string $id, string $documentId): RedirectResponse
    {
        $application = ZoningApplication::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('replaceDocument', $application);

        /** @var ZoningApplicationDocument $oldDocument */
        $oldDocument = $application->documents()
            ->where('id', $documentId)
            ->where('is_current', true)
            ->firstOrFail();

        // Only allow replacement of rejected documents
        if ($oldDocument->status !== 'rejected') {
            return back()->withErrors([
                'error' => 'Only rejected documents can be replaced.',
            ]);
        }

        // Validate request
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
        ]);

        try {
            $basePath = "zoning-applications/{$application->user_id}/{$application->application_number}";
            $file = $request->file('file');
            $fileName = $this->generateFileName($file, $oldDocument->document_type);
            $path = $file->storeAs($basePath, $fileName, 'public');

            // Mark old document as not current
            $oldDocument->update([
                'is_current' => false,
                'replaced_at' => now(),
                'replaced_by' => Auth::id(),
            ]);

            // Get the highest version number for this document type
            $maxVersion = $application->documents()
                ->where('document_type', $oldDocument->document_type)
                ->max('version') ?? 0;

            // Create new document version
            $newDocument = ZoningApplicationDocument::create([
                'zoning_application_id' => $application->id,
                'document_type' => $oldDocument->document_type,
                'type' => 'upload',
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending', // New version starts as pending
                'version' => $maxVersion + 1,
                'parent_document_id' => $oldDocument->id,
                'is_current' => true,
            ]);

            // Get document type name for status history
            $documentTypeName = $this->getDocumentTypeName($oldDocument->document_type);
            $newVersion = $maxVersion + 1;

            // Create status history entry
            ZoningApplicationStatusHistory::create([
                'zoning_application_id' => $application->id,
                'status_from' => $application->status,
                'status_to' => $application->status, // Keep application status the same
                'changed_by' => Auth::id(),
                'notes' => "Document '{$documentTypeName}' uploaded (Version {$newVersion})",
                'created_at' => now(),
            ]);

            // Log audit
            \App\Models\AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'document_replaced',
                'resource_type' => 'zoning_application_document',
                'resource_id' => (string) $oldDocument->id,
                'changes' => [
                    'old_version' => $oldDocument->version,
                    'new_version' => $maxVersion + 1,
                    'document_type' => $oldDocument->document_type,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return back()->with('success', 'Document replaced successfully. The new version is pending review.');
        } catch (\Exception $e) {
            Log::error('Document replacement error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'application_id' => $id,
                'document_id' => $documentId,
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while replacing the document. Please try again.',
            ]);
        }
    }

    /**
     * Get version history for a document.
     */
    public function getDocumentVersions(Request $request, string $id, string $documentId): JsonResponse
    {
        try {
            $application = ZoningApplication::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

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
            Log::error('Document version history - Model not found', [
                'application_id' => $id,
                'document_id' => $documentId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Document not found'], 404);
        } catch (\Exception $e) {
            Log::error('Document version history error', [
                'application_id' => $id,
                'document_id' => $documentId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Failed to load version history'], 500);
        }
    }

    /**
     * Generate a unique file name for storage.
     */
    private function generateFileName(\Illuminate\Http\UploadedFile $file, string $prefix): string
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = now()->format('YmdHis');
        $random = str()->random(8);

        return "{$prefix}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Clean up uploaded files on error.
     */
    private function cleanupFiles(array $filePaths): void
    {
        foreach ($filePaths as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
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
}
