<?php

namespace App\Http\Controllers\Admin;

use App\BeneficiarySector;
use App\BeneficiaryStatus;
use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Services\BeneficiarySectorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BeneficiaryController extends Controller
{
    public function __construct(
        protected BeneficiarySectorService $sectorService
    ) {}

    /**
     * Display a listing of beneficiaries.
     */
    public function index(Request $request): Response
    {
        $query = Beneficiary::with(['applications', 'householdMembers']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('beneficiary_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('beneficiary_status', $request->status);
        } else {
            // By default, exclude "applicant" status - only show actual beneficiaries
            // (qualified, waitlisted, awarded, disqualified, archived)
            // Applicants should only appear in the Applications page, not Beneficiaries
            $query->where('beneficiary_status', '!=', BeneficiaryStatus::Applicant);
        }

        // Filter by sector
        if ($request->has('sector') && $request->sector) {
            $query->whereJsonContains('sector_tags', $request->sector);
        }

        // Filter by barangay
        if ($request->has('barangay') && $request->barangay) {
            $query->where('barangay', $request->barangay);
        }

        $beneficiaries = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($beneficiary) {
                return [
                    'id' => (string) $beneficiary->id,
                    'beneficiary_no' => $beneficiary->beneficiary_no,
                    'full_name' => $beneficiary->full_name,
                    'email' => $beneficiary->email,
                    'contact_number' => $beneficiary->contact_number,
                    'barangay' => $beneficiary->barangay,
                    'sectors' => array_map(fn ($s) => BeneficiarySector::from($s)->label(), $beneficiary->sector_tags ?? []),
                    'status' => $beneficiary->beneficiary_status?->label() ?? null,
                    'total_applications' => $beneficiary->applications->count(),
                    'registered_at' => $beneficiary->registered_at?->format('Y-m-d'),
                ];
            });

        return Inertia::render('Admin/Housing/BeneficiariesIndex', [
            'beneficiaries' => $beneficiaries,
            'filters' => $request->only(['search', 'status', 'sector', 'barangay']),
        ]);
    }

    /**
     * Display the specified beneficiary.
     */
    public function show(string $id): Response
    {
        $beneficiary = Beneficiary::with([
            'applications',
            'documents',
            'householdMembers',
            'siteVisits',
            'awards',
        ])->findOrFail($id);

        $this->authorize('view', $beneficiary);

        return Inertia::render('Admin/Housing/BeneficiaryDetails', [
            'beneficiary' => [
                'id' => (string) $beneficiary->id,
                'beneficiary_no' => $beneficiary->beneficiary_no,
                'first_name' => $beneficiary->first_name,
                'middle_name' => $beneficiary->middle_name,
                'last_name' => $beneficiary->last_name,
                'suffix' => $beneficiary->suffix,
                'full_name' => $beneficiary->full_name,
                'birth_date' => $beneficiary->birth_date?->format('Y-m-d'),
                'age' => $beneficiary->age,
                'gender' => $beneficiary->gender,
                'civil_status' => $beneficiary->civil_status,
                'email' => $beneficiary->email,
                'contact_number' => $beneficiary->contact_number,
                'mobile_number' => $beneficiary->mobile_number,
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
                'id_type' => $beneficiary->id_type,
                'id_number' => $beneficiary->id_number,
                'sector_tags' => $beneficiary->sector_tags,
                'sectors' => array_map(fn ($s) => [
                    'value' => $s,
                    'label' => BeneficiarySector::from($s)->label(),
                ], $beneficiary->sector_tags ?? []),
                'beneficiary_status' => $beneficiary->beneficiary_status?->value,
                'beneficiary_status_label' => $beneficiary->beneficiary_status?->label(),
                'special_eligibility_notes' => $beneficiary->special_eligibility_notes,
                'is_active' => $beneficiary->is_active,
                'archived_at' => $beneficiary->archived_at?->format('Y-m-d H:i:s'),
                'registered_at' => $beneficiary->registered_at?->format('Y-m-d H:i:s'),
                'applications' => $beneficiary->applications,
                'household_members' => $beneficiary->householdMembers,
                'awards' => $beneficiary->awards,
            ],
        ]);
    }

    /**
     * Update beneficiary sectors.
     */
    public function updateSectors(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'sectors' => ['required', 'array'],
            'sectors.*' => ['required', 'string', 'in:isf,pwd,senior_citizen,solo_parent,low_income,disaster_affected'],
        ]);

        $beneficiary = Beneficiary::findOrFail($id);
        $this->authorize('manageSectors', $beneficiary);

        // Validate each sector
        foreach ($request->sectors as $sectorValue) {
            $sector = BeneficiarySector::from($sectorValue);
            if (! $this->sectorService->validateSector($beneficiary, $sector)) {
                return back()->withErrors([
                    'sectors' => "Sector '{$sector->label()}' validation failed. Please verify supporting documents.",
                ]);
            }
        }

        $beneficiary->update(['sector_tags' => $request->sectors]);

        return back()->with('success', 'Beneficiary sectors updated successfully.');
    }

    /**
     * Auto-detect and assign sectors.
     */
    public function autoDetectSectors(string $id): RedirectResponse
    {
        $beneficiary = Beneficiary::findOrFail($id);
        $this->authorize('manageSectors', $beneficiary);
        $this->sectorService->detectAndAssignSectors($beneficiary);

        return back()->with('success', 'Sectors auto-detected and assigned successfully.');
    }

    /**
     * Update beneficiary status.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'beneficiary_status' => ['required', 'string', 'in:applicant,qualified,waitlisted,awarded,disqualified,archived'],
        ]);

        $beneficiary = Beneficiary::findOrFail($id);
        $this->authorize('updateStatus', $beneficiary);
        $beneficiary->update([
            'beneficiary_status' => BeneficiaryStatus::from($request->beneficiary_status),
        ]);

        return back()->with('success', 'Beneficiary status updated successfully.');
    }

    /**
     * Archive a beneficiary.
     */
    public function archive(string $id): RedirectResponse
    {
        $beneficiary = Beneficiary::findOrFail($id);
        $this->authorize('archive', $beneficiary);
        $beneficiary->archive();

        return back()->with('success', 'Beneficiary archived successfully.');
    }

    /**
     * Restore an archived beneficiary.
     */
    public function restore(string $id): RedirectResponse
    {
        $beneficiary = Beneficiary::findOrFail($id);
        $this->authorize('restore', $beneficiary);
        $beneficiary->restore();

        return back()->with('success', 'Beneficiary restored successfully.');
    }
}
