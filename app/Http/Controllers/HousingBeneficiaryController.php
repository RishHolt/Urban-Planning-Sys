<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBeneficiaryApplicationRequest;
use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\BeneficiaryDocument;
use App\Models\HouseholdMember;
use App\Services\BlacklistService;
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
        protected WaitlistService $waitlistService
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

        $application = BeneficiaryApplication::with(['documents', 'siteVisits', 'waitlistEntry', 'allocation'])
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
                'beneficiary' => $application->beneficiary,
                'documents' => $documents,
                'site_visits' => $siteVisits,
                'waitlist' => $application->waitlistEntry,
                'allocation' => $application->allocation,
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
            DB::connection('hbr_db')->beginTransaction();

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
                    'employer_name' => $validated['beneficiary']['employer_name'] ?? null,
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
                    'employer_name' => $validated['beneficiary']['employer_name'] ?? $beneficiary->employer_name,
                    'monthly_income' => $validated['beneficiary']['monthly_income'],
                    'has_existing_property' => $validated['beneficiary']['has_existing_property'] ?? $beneficiary->has_existing_property,
                    'priority_status' => $validated['beneficiary']['priority_status'],
                    'priority_id_no' => $validated['beneficiary']['priority_id_no'] ?? $beneficiary->priority_id_no,
                ]);
            }

            // Check blacklist
            if ($this->blacklistService->isBlacklisted($beneficiary)) {
                return back()->withErrors([
                    'error' => 'You are currently blacklisted and cannot submit applications.',
                ])->withInput();
            }

            // Create application
            $application = BeneficiaryApplication::create([
                'beneficiary_id' => $beneficiary->id,
                'housing_program' => $validated['housing_program'],
                'application_reason' => $validated['application_reason'],
                'application_status' => 'submitted',
                'eligibility_status' => 'pending',
            ]);

            // Check blacklist again and auto-reject if needed
            if ($this->blacklistService->checkAndReject($application)) {
                DB::connection('hbr_db')->commit();

                return redirect()->route('applications.housing.show', $application->id)
                    ->with('error', 'Your application was rejected because you are blacklisted.');
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

            DB::connection('hbr_db')->commit();

            return redirect()->route('applications.housing.success', [
                'applicationNumber' => $application->application_no,
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

        if (isset($validated['documents']) && is_array($validated['documents'])) {
            foreach ($validated['documents'] as $documentData) {
                if (isset($documentData['file']) && $documentData['file']->isValid()) {
                    $file = $documentData['file'];
                    $documentType = $documentData['document_type'];
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
}
