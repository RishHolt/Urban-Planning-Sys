<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHousingBeneficiaryApplicationRequest;
use App\Http\Requests\UpdateHousingBeneficiaryApplicationRequest;
use App\Models\Household;
use App\Models\HousingBeneficiary;
use App\Models\HousingBeneficiaryApplication;
use App\Models\HousingBeneficiaryDocument;
use App\Models\HousingBeneficiaryStatusHistory;
use App\Services\HousingBeneficiaryLabelService;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HousingBeneficiaryController extends Controller
{
    /**
     * Display a listing of the user's housing applications.
     */
    public function index(Request $request): Response
    {
        // Map status to match StatusBadge expected values
        $statusMap = [
            'draft' => 'pending',
            'submitted' => 'pending',
            'under_review' => 'in_review',
            'approved' => 'approved',
            'rejected' => 'rejected',
        ];

        $applications = HousingBeneficiaryApplication::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($application) use ($statusMap) {
                $mappedStatus = $statusMap[$application->status] ?? 'pending';

                return [
                    'id' => (string) $application->id,
                    'applicationNumber' => $application->application_number,
                    'projectType' => HousingBeneficiaryLabelService::getApplicationTypeLabel($application->application_type),
                    'status' => $mappedStatus,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Applications/Housing/ApplicationsIndex', [
            'applications' => $applications,
        ]);
    }

    /**
     * Show the housing application form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', HousingBeneficiaryApplication::class);

        return Inertia::render('Applications/Housing/ApplicationForm');
    }

    /**
     * Display the specified housing application.
     */
    public function show(string $id): Response
    {
        $application = HousingBeneficiaryApplication::with(['documents', 'statusHistory', 'beneficiary', 'household'])
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

        // Map status to match StatusBadge expected values
        $statusMap = [
            'draft' => 'pending',
            'submitted' => 'pending',
            'under_review' => 'in_review',
            'approved' => 'approved',
            'rejected' => 'rejected',
        ];
        $mappedStatus = $statusMap[$application->status] ?? 'pending';

        return Inertia::render('Applications/Housing/ApplicationDetails', [
            'application' => [
                'id' => (string) $application->id,
                'applicationNumber' => $application->application_number,
                'applicationType' => HousingBeneficiaryLabelService::getApplicationTypeLabel($application->application_type),
                'status' => $mappedStatus, // Map to StatusBadge expected values
                'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'createdAt' => $application->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $application->updated_at?->format('Y-m-d H:i:s'),
                'beneficiary' => $application->beneficiary,
                'household' => $application->household,
                'applicationNotes' => $application->application_notes,
                'rejectionReason' => $application->rejection_reason,
                'documents' => $documents,
                'statusHistory' => $statusHistory,
            ],
        ]);
    }

    /**
     * Store the housing application.
     */
    public function store(StoreHousingBeneficiaryApplicationRequest $request): RedirectResponse
    {
        $this->authorize('create', HousingBeneficiaryApplication::class);

        try {
            DB::connection('hbr_db')->beginTransaction();

            $validated = $request->validated();
            $userId = Auth::id();
            $applicationType = $validated['applicationType'];

            // Generate application number
            $applicationNumber = HousingBeneficiaryApplication::generateApplicationNumber();

            // Create beneficiary or household based on application type
            if ($applicationType === 'individual') {
                $beneficiary = $this->createBeneficiary($validated['beneficiary'] ?? [], $userId);
                $householdId = null;
                $beneficiaryId = $beneficiary->id;
            } else {
                $household = $this->createHousehold($validated['household'] ?? [], $userId);
                $householdId = $household->id;
                $beneficiaryId = null;
            }

            // Create application
            $application = HousingBeneficiaryApplication::create([
                'user_id' => $userId,
                'application_number' => $applicationNumber,
                'application_type' => $applicationType,
                'housing_beneficiary_id' => $beneficiaryId,
                'household_id' => $householdId,
                'status' => 'submitted',
                'submitted_at' => now(),
                'application_notes' => $validated['applicationNotes'] ?? null,
            ]);

            // Store documents
            $this->storeDocuments($application, $request, $validated);

            // Create initial status history entry
            HousingBeneficiaryStatusHistory::create([
                'housing_beneficiary_application_id' => $application->id,
                'status_from' => null,
                'status_to' => 'submitted',
                'changed_by' => $userId,
                'notes' => 'Application submitted',
                'created_at' => now(),
            ]);

            // Create notification
            NotificationService::notifyApplicationStatusChange(
                $userId,
                $applicationNumber,
                'draft',
                'submitted',
                $application->id
            );

            DB::connection('hbr_db')->commit();

            return redirect()->route('applications.housing.success', [
                'applicationNumber' => $applicationNumber,
            ]);
        } catch (\Exception $e) {
            DB::connection('hbr_db')->rollBack();

            Log::error('Housing beneficiary application submission error', [
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
     * Update the specified housing application (draft only).
     */
    public function update(UpdateHousingBeneficiaryApplicationRequest $request, string $id): RedirectResponse
    {
        $application = HousingBeneficiaryApplication::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('update', $application);

        if ($application->status !== 'draft') {
            return back()->withErrors([
                'error' => 'Only draft applications can be updated.',
            ]);
        }

        try {
            DB::connection('hbr_db')->beginTransaction();

            $validated = $request->validated();

            // Update beneficiary or household
            if ($application->application_type === 'individual' && isset($validated['beneficiary'])) {
                if ($application->beneficiary) {
                    $application->beneficiary->update($validated['beneficiary']);
                } else {
                    $beneficiary = $this->createBeneficiary($validated['beneficiary'], Auth::id());
                    $application->update(['housing_beneficiary_id' => $beneficiary->id]);
                }
            } elseif ($application->application_type === 'household' && isset($validated['household'])) {
                if ($application->household) {
                    $application->household->update($validated['household']);
                } else {
                    $household = $this->createHousehold($validated['household'], Auth::id());
                    $application->update(['household_id' => $household->id]);
                }
            }

            // Update application notes
            if (isset($validated['applicationNotes'])) {
                $application->update(['application_notes' => $validated['applicationNotes']]);
            }

            // Store new documents if provided
            $this->storeDocuments($application, $request, $validated);

            DB::connection('hbr_db')->commit();

            return redirect()->back()->with('success', 'Application updated successfully.');
        } catch (\Exception $e) {
            DB::connection('hbr_db')->rollBack();

            Log::error('Housing beneficiary application update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'application_id' => $id,
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while updating the application. Please try again.',
            ]);
        }
    }

    /**
     * Upload additional requested documents for an existing application.
     */
    public function uploadDocuments(Request $request, string $id): RedirectResponse
    {
        $application = HousingBeneficiaryApplication::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('uploadDocuments', $application);

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
            $basePath = "housing-applications/{$application->user_id}/{$application->application_number}";
            $uploadedFiles = [];

            foreach ($request->file('requestedDocuments') as $file) {
                $fileName = $this->generateFileName($file, 'requested_document');
                $path = $file->storeAs($basePath, $fileName, 'public');

                $maxVersion = $application->documents()
                    ->where('document_type', 'requested_documents')
                    ->max('version') ?? 0;

                $uploadedFiles[] = HousingBeneficiaryDocument::create([
                    'housing_beneficiary_application_id' => $application->id,
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

            foreach ($uploadedFiles as $uploadedDoc) {
                HousingBeneficiaryStatusHistory::create([
                    'housing_beneficiary_application_id' => $application->id,
                    'status_from' => $application->status,
                    'status_to' => $application->status,
                    'changed_by' => Auth::id(),
                    'notes' => "Document 'Requested Documents' uploaded (Version {$uploadedDoc->version})",
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
        $application = HousingBeneficiaryApplication::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $this->authorize('replaceDocument', $application);

        $oldDocument = $application->documents()
            ->where('id', $documentId)
            ->where('is_current', true)
            ->firstOrFail();

        if ($oldDocument->status !== 'rejected') {
            return back()->withErrors([
                'error' => 'Only rejected documents can be replaced.',
            ]);
        }

        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
        ]);

        try {
            $basePath = "housing-applications/{$application->user_id}/{$application->application_number}";
            $file = $request->file('file');
            $fileName = $this->generateFileName($file, $oldDocument->document_type);
            $path = $file->storeAs($basePath, $fileName, 'public');

            $oldDocument->update([
                'is_current' => false,
                'replaced_at' => now(),
                'replaced_by' => Auth::id(),
            ]);

            $maxVersion = $application->documents()
                ->where('document_type', $oldDocument->document_type)
                ->max('version') ?? 0;

            $newDocument = HousingBeneficiaryDocument::create([
                'housing_beneficiary_application_id' => $application->id,
                'document_type' => $oldDocument->document_type,
                'type' => 'upload',
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
                'version' => $maxVersion + 1,
                'parent_document_id' => $oldDocument->id,
                'is_current' => true,
            ]);

            HousingBeneficiaryStatusHistory::create([
                'housing_beneficiary_application_id' => $application->id,
                'status_from' => $application->status,
                'status_to' => $application->status,
                'changed_by' => Auth::id(),
                'notes' => "Document '".HousingBeneficiaryLabelService::getDocumentTypeLabel($oldDocument->document_type)."' replaced (Version {$newDocument->version})",
                'created_at' => now(),
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
     * Create a beneficiary record.
     */
    private function createBeneficiary(array $data, int $userId): HousingBeneficiary
    {
        return HousingBeneficiary::create([
            'user_id' => $userId,
            'first_name' => $data['firstName'] ?? null,
            'last_name' => $data['lastName'] ?? null,
            'middle_name' => $data['middleName'] ?? null,
            'suffix' => $data['suffix'] ?? null,
            'birth_date' => $data['birthDate'] ?? null,
            'gender' => $data['gender'] ?? null,
            'civil_status' => $data['civilStatus'] ?? null,
            'email' => $data['email'] ?? null,
            'mobile_number' => $data['mobileNumber'] ?? null,
            'telephone_number' => $data['telephoneNumber'] ?? null,
            'address' => $data['address'] ?? null,
            'street' => $data['street'] ?? null,
            'barangay' => $data['barangay'] ?? null,
            'city' => $data['city'] ?? null,
            'province' => $data['province'] ?? null,
            'zip_code' => $data['zipCode'] ?? null,
            'employment_status' => $data['employmentStatus'] ?? null,
            'occupation' => $data['occupation'] ?? null,
            'employer_name' => $data['employerName'] ?? null,
            'monthly_income' => $data['monthlyIncome'] ?? null,
            'household_income' => $data['householdIncome'] ?? null,
            'is_indigent' => $data['isIndigent'] ?? false,
            'is_senior_citizen' => $data['isSeniorCitizen'] ?? false,
            'is_pwd' => $data['isPwd'] ?? false,
            'is_single_parent' => $data['isSingleParent'] ?? false,
            'is_victim_of_disaster' => $data['isVictimOfDisaster'] ?? false,
            'special_eligibility_notes' => $data['specialEligibilityNotes'] ?? null,
        ]);
    }

    /**
     * Create a household record.
     */
    private function createHousehold(array $data, int $userId): Household
    {
        return Household::create([
            'household_name' => $data['householdName'] ?? null,
            'primary_contact_mobile' => $data['primaryContactMobile'] ?? null,
            'primary_contact_email' => $data['primaryContactEmail'] ?? null,
            'address' => $data['address'] ?? null,
            'barangay' => $data['barangay'] ?? null,
            'city' => $data['city'] ?? null,
            'province' => $data['province'] ?? null,
            'household_size' => $data['householdSize'] ?? 1,
            'total_monthly_income' => $data['totalMonthlyIncome'] ?? null,
        ]);
    }

    /**
     * Store documents for the application.
     */
    private function storeDocuments(HousingBeneficiaryApplication $application, Request $request, array $validated): void
    {
        $basePath = "housing-applications/{$application->user_id}/{$application->application_number}";
        $documents = $validated['documents'] ?? [];

        $documentTypes = [
            'proofOfIdentity' => 'proof_of_identity',
            'proofOfIncome' => 'proof_of_income',
            'proofOfResidence' => 'proof_of_residence',
            'specialEligibilityCertificate' => 'special_eligibility_certificate',
        ];

        foreach ($documentTypes as $field => $documentType) {
            if ($request->hasFile("documents.{$field}")) {
                $file = $request->file("documents.{$field}");
                $fileName = $this->generateFileName($file, $documentType);
                $path = $file->storeAs($basePath, $fileName, 'public');

                HousingBeneficiaryDocument::create([
                    'housing_beneficiary_application_id' => $application->id,
                    'document_type' => $documentType,
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
     * Generate a unique file name for storage.
     */
    private function generateFileName(\Illuminate\Http\UploadedFile $file, string $prefix): string
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = now()->format('YmdHis');
        $random = str()->random(8);

        return "{$prefix}_{$timestamp}_{$random}.{$extension}";
    }
}
