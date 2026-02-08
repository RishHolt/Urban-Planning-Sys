<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContractorRequest;
use App\Http\Requests\UpdateContractorRequest;
use App\Models\Contractor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContractorController extends Controller
{
    /**
     * Display a listing of contractors.
     */
    public function index(Request $request): Response
    {
        $query = Contractor::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('contractor_code', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('license_number', 'like', "%{$search}%");
            });
        }

        // Filter by contractor type
        if ($request->has('contractor_type') && $request->contractor_type) {
            $query->where('contractor_type', $request->contractor_type);
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $contractors = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($contractor) {
                return [
                    'id' => (string) $contractor->id,
                    'contractor_code' => $contractor->contractor_code,
                    'company_name' => $contractor->company_name,
                    'contact_person' => $contractor->contact_person,
                    'contact_number' => $contractor->contact_number,
                    'email' => $contractor->email,
                    'contractor_type' => $contractor->contractor_type,
                    'is_active' => $contractor->is_active,
                    'projects_count' => $contractor->projects()->count(),
                ];
            });

        return Inertia::render('Admin/Infrastructure/ContractorsIndex', [
            'contractors' => $contractors,
            'filters' => $request->only(['search', 'contractor_type', 'is_active']),
        ]);
    }

    /**
     * Store a newly created contractor.
     */
    public function store(StoreContractorRequest $request): RedirectResponse
    {
        DB::beginTransaction();

        try {
            // Generate contractor code
            $year = now()->year;
            $lastContractor = Contractor::whereYear('created_at', $year)
                ->orderBy('id', 'desc')
                ->first();

            $sequence = $lastContractor ? (int) Str::afterLast($lastContractor->contractor_code, '-') + 1 : 1;
            $contractorCode = sprintf('CTR-%d-%05d', $year, $sequence);

            Contractor::create(array_merge(
                $request->validated(),
                [
                    'contractor_code' => $contractorCode,
                    'is_active' => true,
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Contractor registered successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to register contractor: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified contractor.
     */
    public function show(string $id): Response
    {
        $contractor = Contractor::with(['projects.project'])->findOrFail($id);

        return Inertia::render('Admin/Infrastructure/ContractorShow', [
            'contractor' => $contractor,
        ]);
    }

    /**
     * Update the specified contractor.
     */
    public function update(UpdateContractorRequest $request, string $id): RedirectResponse
    {
        $contractor = Contractor::findOrFail($id);

        $contractor->update($request->validated());

        return redirect()->back()
            ->with('success', 'Contractor updated successfully.');
    }

    /**
     * Remove the specified contractor (deactivate).
     */
    public function destroy(string $id): RedirectResponse
    {
        $contractor = Contractor::findOrFail($id);

        $contractor->update(['is_active' => false]);

        return redirect()->back()
            ->with('success', 'Contractor deactivated successfully.');
    }
}
