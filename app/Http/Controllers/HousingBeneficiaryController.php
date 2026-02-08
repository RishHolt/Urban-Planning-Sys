<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBeneficiaryApplicationRequest;
use App\Http\Requests\UpdateBeneficiaryApplicationRequest;
use App\Http\Requests\UpdateBeneficiaryProfileRequest;
use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\BeneficiaryDocument;
use App\Models\HouseholdMember;
use App\Services\ApplicationValidationService;
use App\Services\BlacklistService;
use App\Services\DuplicateCheckService;
use App\Services\NotificationService;
use App\Services\WaitlistService;
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
    public function __construct(
        protected BlacklistService $blacklistService,
        protected WaitlistService $waitlistService,
        protected DuplicateCheckService $duplicateCheckService,
        protected ApplicationValidationService $validationService
    ) {}

    /**
     * Display a listing of the user's housing applications.
     */
    public function index(Request $request): Response
    {
        // Get beneficiary for current user
        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->first();

        if (! $beneficiary) {
            return Inertia::render('Applications/Housing/ApplicationsIndex', [
                'applications' => [],
            ]);
        }

        $applications = BeneficiaryApplication::with('beneficiary')
            ->where('beneficiary_id', $beneficiary->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($application) {
                return [
                    'id' => (string) $application->id,
                    'applicationNumber' => $application->application_no,
                    'projectType' => str_replace('_', ' ', ucfirst($application->housing_program)),
                    'status' => $application->application_status,
                    'eligibilityStatus' => $application->eligibility_status,
                    'submittedAt' => $application->submitted_at?->format('Y-m-d H:i:s'),
                    'municipality' => 'Cauayan City',
                    'barangay' => $application->beneficiary?->barangay,
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
        $this->authorize('create', BeneficiaryApplication::class);

        // Check if user has a beneficiary record
        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->first();

        return Inertia::render('Applications/Housing/ApplicationForm', [
            'beneficiary' => $beneficiary,
        ]);
    }

    /**
     * Display the specified housing application.
     */
    public function show(string $id): Response
    {
        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $application = BeneficiaryApplication::with(['documents', 'siteVisits', 'waitlistEntry', 'allocation', 'awards', 'awards.unit', 'awards.unit.project', 'caseOfficer'])
            ->where('id', $id)
            ->where('beneficiary_id', $beneficiary->id)
            ->firstOrFail();

        $this->authorize('view', $application);

        // Format documents
        $documents = $application->documents->map(function ($doc) {
            return [
                'id' => (string) $doc->id,
                'document_type' => $doc->document_type,
                'file_name' => $doc->file_name,
                'url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
                'verification_status' => $doc->verification_status,
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

        // Format award if exists (get the latest award)
        $latestAward = $application->awards()->latest()->first();
        $award = $latestAward ? [
            'id' => (string) $latestAward->id,
            'award_no' => $latestAward->award_no,
            'award_date' => $latestAward->award_date?->format('Y-m-d'),
            'acceptance_deadline' => $latestAward->acceptance_deadline?->format('Y-m-d'),
            'accepted_at' => $latestAward->accepted_at?->format('Y-m-d H:i:s'),
            'status' => $latestAward->award_status,
            'unit' => $latestAward->unit ? [
                'unit_no' => $latestAward->unit->unit_no,
                'project' => $latestAward->unit->project ? [
                    'project_name' => $latestAward->unit->project->project_name,
                ] : null,
            ] : null,
        ] : null;

        // Format case officer if exists
        $caseOfficer = $application->caseOfficer ? [
            'id' => $application->caseOfficer->id,
            'name' => $application->caseOfficer->first_name.' '.$application->caseOfficer->last_name,
            'email' => $application->caseOfficer->email,
        ] : null;

        return Inertia::render('Applications/Housing/ApplicationDetails', [
            'application' => [
                'id' => (string) $application->id,
                'application_no' => $application->application_no,
                'housing_program' => $application->housing_program,
                'application_reason' => $application->application_reason,
                'application_status' => $application->application_status,
                'eligibility_status' => $application->eligibility_status,
                'eligibility_remarks' => $application->eligibility_remarks,
                'submitted_at' => $application->submitted_at?->format('Y-m-d H:i:s'),
                'case_officer' => $caseOfficer,
                'beneficiary' => $application->beneficiary,
                'documents' => $documents,
                'site_visits' => $siteVisits,
                'waitlist' => $application->waitlistEntry,
                'allocation' => $application->allocation,
                'award' => $award,
            ],
        ]);
    }

    /**
     * Store the housing application.
     */
    public function store(StoreBeneficiaryApplicationRequest $request): RedirectResponse
    {
        $this->authorize('create', BeneficiaryApplication::class);

        try {
            DB::beginTransaction();

            $validated = $request->validated();
            $userId = Auth::id();

            // Get or create beneficiary
            $beneficiary = Beneficiary::where('citizen_id', $userId)->first();
            if (! $beneficiary) {
                // Create beneficiary from form data
                $beneficiary = Beneficiary::create([
                    'citizen_id' => $userId,
                    'first_name' => $validated['beneficiary']['first_name'],
                    'last_name' => $validated['beneficiary']['last_name'],
                    'middle_name' => $validated['beneficiary']['middle_name'] ?? null,
                    'birth_date' => $validated['beneficiary']['birth_date'],
                    'gender' => $validated['beneficiary']['gender'],
                    'civil_status' => $validated['beneficiary']['civil_status'],
                    'email' => $validated['beneficiary']['email'],
                    'contact_number' => $validated['beneficiary']['contact_number'],
                    'current_address' => $validated['beneficiary']['current_address'],
                    'barangay' => $validated['beneficiary']['barangay'],
                    'years_of_residency' => $validated['beneficiary']['years_of_residency'],
                    'employment_status' => $validated['beneficiary']['employment_status'],
                    'monthly_income' => $validated['beneficiary']['monthly_income'],
                    'has_existing_property' => $validated['beneficiary']['has_existing_property'] ?? false,
                    'priority_status' => $validated['beneficiary']['priority_status'],
                    'priority_id_no' => $validated['beneficiary']['priority_id_no'] ?? null,
                    'is_active' => true,
                ]);
            } else {
                // Update existing beneficiary with form data
                $beneficiary->update([
                    'first_name' => $validated['beneficiary']['first_name'],
                    'last_name' => $validated['beneficiary']['last_name'],
                    'middle_name' => $validated['beneficiary']['middle_name'] ?? $beneficiary->middle_name,
                    'birth_date' => $validated['beneficiary']['birth_date'],
                    'gender' => $validated['beneficiary']['gender'],
                    'civil_status' => $validated['beneficiary']['civil_status'],
                    'email' => $validated['beneficiary']['email'],
                    'contact_number' => $validated['beneficiary']['contact_number'],
                    'current_address' => $validated['beneficiary']['current_address'],
                    'barangay' => $validated['beneficiary']['barangay'],
                    'years_of_residency' => $validated['beneficiary']['years_of_residency'],
                    'employment_status' => $validated['beneficiary']['employment_status'],
                    'monthly_income' => $validated['beneficiary']['monthly_income'],
                    'has_existing_property' => $validated['beneficiary']['has_existing_property'] ?? $beneficiary->has_existing_property,
                    'priority_status' => $validated['beneficiary']['priority_status'],
                    'priority_id_no' => $validated['beneficiary']['priority_id_no'] ?? $beneficiary->priority_id_no,
                ]);
            }

            // Check blacklist - only check if beneficiary has an ID (not a new record)
            // This prevents false positives from duplicate checks
            if ($beneficiary->id && $this->blacklistService->isBlacklisted($beneficiary)) {
                $blacklist = $this->blacklistService->getActiveBlacklist($beneficiary);
                $errorMessage = 'You are currently blacklisted and cannot submit applications.';
                if ($blacklist) {
                    $errorMessage .= ' Reason: '.$blacklist->reason;
                }

                Log::warning('Blacklisted beneficiary attempted to submit application', [
                    'beneficiary_id' => $beneficiary->id,
                    'citizen_id' => $userId,
                    'blacklist_id' => $blacklist?->id,
                ]);

                return back()->withErrors([
                    'error' => $errorMessage,
                ])->withInput();
            }

            // Check for duplicates
            $duplicateResult = $this->duplicateCheckService->checkDuplicates($beneficiary);
            if ($duplicateResult->hasDuplicates) {
                $duplicateWarnings = collect($duplicateResult->potentialDuplicates)
                    ->map(fn ($dup) => "Potential duplicate: {$dup['name']} ({$dup['beneficiary_no']}) - {$dup['details']}")
                    ->implode('; ');

                Log::warning('Duplicate beneficiary detected during application submission', [
                    'beneficiary_id' => $beneficiary->id,
                    'duplicates' => $duplicateResult->potentialDuplicates,
                ]);

                // Allow submission but log warning - admin will review
            }

            // Create application
            $application = BeneficiaryApplication::create([
                'beneficiary_id' => $beneficiary->id,
                'housing_program' => $validated['housing_program'],
                'application_reason' => $validated['application_reason'],
                'application_status' => 'submitted',
                'eligibility_status' => 'pending',
            ]);

            // Validate application after creation
            $validationResult = $this->validationService->validateApplication($application);

            // Check blacklist again and auto-reject if needed
            if ($this->blacklistService->checkAndReject($application)) {
                DB::commit();

                return redirect()->route('applications.housing.show', $application->id)
                    ->with('error', 'Your application was rejected because you are blacklisted.');
            }

            // If validation fails, log but allow submission (admin will review)
            if (! $validationResult->isValid) {
                Log::info('Application submitted with validation issues', [
                    'application_id' => $application->id,
                    'validation_result' => $validationResult->toArray(),
                ]);
            }

            // Store documents
            $this->storeDocuments($application, $request, $validated);

            // Store household members
            $this->storeHouseholdMembers($beneficiary, $validated);

            // Create notification
            NotificationService::notifyApplicationStatusChange(
                $userId,
                $application->application_no,
                null,
                'submitted',
                $application->id
            );

            DB::commit();

            // Return success with application ID confirmation
            return redirect()->route('applications.housing.success', [
                'applicationNumber' => $application->application_no,
                'applicationId' => $application->id,
            ])->with('success', 'Application submitted successfully. Your application ID is: '.$application->application_no);
        } catch (\Exception $e) {
            DB::rollBack();

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
     * Create beneficiary from user data.
     */
    private function createBeneficiaryFromUser(int $userId): Beneficiary
    {
        $user = \App\Models\User::findOrFail($userId);

        return Beneficiary::create([
            'citizen_id' => $userId,
            'first_name' => $user->first_name,
            'middle_name' => $user->middle_name,
            'last_name' => $user->last_name,
            'birth_date' => $user->profile->birth_date ?? now()->subYears(25),
            'gender' => $user->profile->gender ?? 'male',
            'civil_status' => $user->profile->civil_status ?? 'single',
            'contact_number' => $user->profile->mobile_number ?? '',
            'email' => $user->email,
            'current_address' => $user->profile->address ?? '',
            'barangay' => $user->profile->barangay ?? '',
            'years_of_residency' => 0,
            'employment_status' => 'unemployed',
            'monthly_income' => 0,
            'priority_status' => 'none',
            'is_active' => true,
        ]);
    }

    /**
     * Store documents for the application.
     */
    private function storeDocuments(BeneficiaryApplication $application, Request $request, array $validated): void
    {
        $basePath = "housing-applications/{$application->beneficiary_id}/{$application->application_no}";
        $maxSize = config('housing.validation.document_max_size_mb', 10) * 1024; // Convert to KB
        $allowedTypes = config('housing.validation.allowed_document_types', ['jpeg', 'jpg', 'png', 'pdf']);

        if (isset($validated['documents']) && is_array($validated['documents'])) {
            foreach ($validated['documents'] as $documentData) {
                if (isset($documentData['file']) && $documentData['file']->isValid()) {
                    $file = $documentData['file'];
                    $documentType = $documentData['document_type'];

                    // Validate file size
                    if ($file->getSize() > $maxSize * 1024) {
                        Log::warning('Document upload rejected: file size exceeds limit', [
                            'application_id' => $application->id,
                            'document_type' => $documentType,
                            'file_size' => $file->getSize(),
                            'max_size' => $maxSize * 1024,
                        ]);

                        continue;
                    }

                    // Validate file type
                    $extension = strtolower($file->getClientOriginalExtension());
                    if (! in_array($extension, $allowedTypes)) {
                        Log::warning('Document upload rejected: invalid file type', [
                            'application_id' => $application->id,
                            'document_type' => $documentType,
                            'file_extension' => $extension,
                            'allowed_types' => $allowedTypes,
                        ]);

                        continue;
                    }

                    $fileName = $this->generateFileName($file, $documentType);
                    $path = $file->storeAs($basePath, $fileName, 'public');

                    BeneficiaryDocument::create([
                        'beneficiary_id' => $application->beneficiary_id,
                        'application_id' => $application->id,
                        'document_type' => $documentType,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'verification_status' => 'pending',
                    ]);
                }
            }
        }
    }

    /**
     * Store household members for the beneficiary.
     */
    private function storeHouseholdMembers(Beneficiary $beneficiary, array $validated): void
    {
        if (isset($validated['household_members']) && is_array($validated['household_members'])) {
            foreach ($validated['household_members'] as $memberData) {
                HouseholdMember::create([
                    'beneficiary_id' => $beneficiary->id,
                    'full_name' => $memberData['full_name'],
                    'relationship' => $memberData['relationship'],
                    'birth_date' => $memberData['birth_date'],
                    'gender' => $memberData['gender'],
                    'occupation' => $memberData['occupation'] ?? null,
                    'monthly_income' => $memberData['monthly_income'] ?? 0,
                    'is_dependent' => $memberData['is_dependent'] ?? false,
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

    /**
     * Update the specified housing application.
     */
    public function update(UpdateBeneficiaryApplicationRequest $request, string $id): RedirectResponse
    {
        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $application = BeneficiaryApplication::where('id', $id)
            ->where('beneficiary_id', $beneficiary->id)
            ->firstOrFail();

        $this->authorize('update', $application);

        // Only allow updates if application status is 'submitted'
        if ($application->application_status !== 'submitted') {
            return back()->withErrors([
                'error' => 'You can only update applications that are in "submitted" status.',
            ]);
        }

        $validated = $request->validated();

        $application->update($validated);

        return redirect()->route('applications.housing.show', $application->id)
            ->with('success', 'Application updated successfully.');
    }

    /**
     * Upload additional documents to an application.
     */
    public function uploadDocuments(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'documents' => ['required', 'array', 'min:1'],
            'documents.*.document_type' => ['required', 'in:valid_id,birth_certificate,marriage_certificate,income_proof,barangay_certificate,tax_declaration,dswd_certification,pwd_id,senior_citizen_id,solo_parent_id,disaster_certificate'],
            'documents.*.file' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
        ]);

        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $application = BeneficiaryApplication::where('id', $id)
            ->where('beneficiary_id', $beneficiary->id)
            ->firstOrFail();

        $this->authorize('uploadDocuments', $application);

        try {
            $this->storeDocuments($application, $request, $request->all());

            return redirect()->route('applications.housing.show', $application->id)
                ->with('success', 'Documents uploaded successfully.');
        } catch (\Exception $e) {
            Log::error('Document upload error', [
                'application_id' => $application->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while uploading documents. Please try again.',
            ]);
        }
    }

    /**
     * Replace an existing document in an application.
     */
    public function replaceDocument(Request $request, string $id, string $documentId): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
        ]);

        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $application = BeneficiaryApplication::where('id', $id)
            ->where('beneficiary_id', $beneficiary->id)
            ->firstOrFail();

        $document = BeneficiaryDocument::where('id', $documentId)
            ->where('application_id', $application->id)
            ->firstOrFail();

        $this->authorize('replaceDocument', $application);

        try {
            // Delete old file
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            // Store new file
            $basePath = "housing-applications/{$application->beneficiary_id}/{$application->application_no}";
            $file = $request->file('file');
            $fileName = $this->generateFileName($file, $document->document_type);
            $path = $file->storeAs($basePath, $fileName, 'public');

            // Update document record
            $document->update([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'verification_status' => 'pending', // Reset verification status
            ]);

            return redirect()->route('applications.housing.show', $application->id)
                ->with('success', 'Document replaced successfully.');
        } catch (\Exception $e) {
            Log::error('Document replace error', [
                'application_id' => $application->id,
                'document_id' => $documentId,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while replacing the document. Please try again.',
            ]);
        }
    }

    /**
     * Accept an award for an application.
     */
    public function acceptAward(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $application = BeneficiaryApplication::where('id', $id)
            ->where('beneficiary_id', $beneficiary->id)
            ->firstOrFail();

        $award = $application->award;

        if (! $award) {
            return back()->withErrors([
                'error' => 'No award found for this application.',
            ]);
        }

        if ($award->status !== 'approved') {
            return back()->withErrors([
                'error' => 'Award must be approved before it can be accepted.',
            ]);
        }

        try {
            $awardService = app(\App\Services\AwardService::class);
            $awardService->acceptAward($award, $request->input('remarks'));

            return redirect()->route('applications.housing.show', $application->id)
                ->with('success', 'Award accepted successfully.');
        } catch (\Exception $e) {
            Log::error('Award acceptance error', [
                'application_id' => $application->id,
                'award_id' => $award->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while accepting the award. Please try again.',
            ]);
        }
    }

    /**
     * Decline an award for an application.
     */
    public function declineAward(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $application = BeneficiaryApplication::where('id', $id)
            ->where('beneficiary_id', $beneficiary->id)
            ->firstOrFail();

        $award = $application->award;

        if (! $award) {
            return back()->withErrors([
                'error' => 'No award found for this application.',
            ]);
        }

        if ($award->status !== 'approved') {
            return back()->withErrors([
                'error' => 'Award must be approved before it can be declined.',
            ]);
        }

        try {
            $awardService = app(\App\Services\AwardService::class);
            $awardService->declineAward($award, $request->input('reason'));

            return redirect()->route('applications.housing.show', $application->id)
                ->with('success', 'Award declined successfully.');
        } catch (\Exception $e) {
            Log::error('Award decline error', [
                'application_id' => $application->id,
                'award_id' => $award->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while declining the award. Please try again.',
            ]);
        }
    }

    /**
     * Show the beneficiary profile.
     */
    public function showProfile(): Response
    {
        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->first();

        if (! $beneficiary) {
            return Inertia::render('Applications/Housing/BeneficiaryProfile', [
                'beneficiary' => null,
            ]);
        }

        return Inertia::render('Applications/Housing/BeneficiaryProfile', [
            'beneficiary' => [
                'id' => (string) $beneficiary->id,
                'beneficiary_no' => $beneficiary->beneficiary_no,
                'first_name' => $beneficiary->first_name,
                'last_name' => $beneficiary->last_name,
                'middle_name' => $beneficiary->middle_name,
                'suffix' => $beneficiary->suffix,
                'birth_date' => $beneficiary->birth_date?->format('Y-m-d'),
                'gender' => $beneficiary->gender,
                'civil_status' => $beneficiary->civil_status,
                'email' => $beneficiary->email,
                'contact_number' => $beneficiary->contact_number,
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
                'beneficiary_status' => $beneficiary->beneficiary_status?->value,
            ],
        ]);
    }

    /**
     * Update the beneficiary profile.
     */
    public function updateProfile(UpdateBeneficiaryProfileRequest $request): RedirectResponse
    {
        $beneficiary = Beneficiary::where('citizen_id', Auth::id())->firstOrFail();

        $this->authorize('update', $beneficiary);

        try {
            $validated = $request->validated();
            $beneficiary->update($validated);

            return redirect()->route('beneficiary.profile.show')
                ->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Beneficiary profile update error', [
                'beneficiary_id' => $beneficiary->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'An error occurred while updating your profile. Please try again.',
            ])->withInput();
        }
    }
}
