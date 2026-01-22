<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAllocationRequest;
use App\Models\Allocation;
use App\Models\BeneficiaryApplication;
use App\Models\HousingUnit;
use App\Services\AllocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AllocationController extends Controller
{
    public function __construct(
        protected AllocationService $allocationService
    ) {}

    /**
     * Display a listing of allocations.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Allocation::class);

        $query = Allocation::with(['beneficiary', 'application', 'unit']);

        if ($request->has('status')) {
            $query->where('allocation_status', $request->status);
        }

        $allocations = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($allocation) {
                return [
                    'id' => (string) $allocation->id,
                    'allocation_no' => $allocation->allocation_no,
                    'beneficiary' => $allocation->beneficiary->full_name,
                    'unit_no' => $allocation->unit->unit_no,
                    'allocation_status' => $allocation->allocation_status,
                    'allocation_date' => $allocation->allocation_date->format('Y-m-d'),
                    'acceptance_deadline' => $allocation->acceptance_deadline->format('Y-m-d'),
                ];
            });

        return Inertia::render('Admin/Housing/AllocationsIndex', [
            'allocations' => $allocations,
        ]);
    }

    /**
     * Store a newly created allocation (propose allocation).
     */
    public function store(StoreAllocationRequest $request): RedirectResponse
    {
        $this->authorize('create', Allocation::class);

        $application = BeneficiaryApplication::findOrFail($request->application_id);
        $unit = HousingUnit::findOrFail($request->unit_id);

        $allocation = $this->allocationService->proposeAllocation(
            $application,
            $unit,
            $request->total_contract_price,
            $request->monthly_amortization,
            $request->amortization_months,
            $request->special_conditions,
            auth()->id()
        );

        return redirect()->back()->with('success', 'Allocation proposed successfully.');
    }

    /**
     * Approve an allocation.
     */
    public function approve(Request $request, string $id): RedirectResponse
    {
        $allocation = Allocation::findOrFail($id);

        $this->authorize('approve', $allocation);

        $this->allocationService->approveAllocation($allocation, auth()->id());

        return redirect()->back()->with('success', 'Allocation approved successfully.');
    }

    /**
     * Reject an allocation.
     */
    public function reject(Request $request, string $id): RedirectResponse
    {
        $allocation = Allocation::findOrFail($id);

        $this->authorize('update', $allocation);

        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $this->allocationService->rejectAllocation($allocation, $request->reason, auth()->id());

        return redirect()->back()->with('success', 'Allocation rejected successfully.');
    }

    /**
     * Accept an allocation (beneficiary action).
     */
    public function accept(Request $request, string $id): RedirectResponse
    {
        $allocation = Allocation::findOrFail($id);

        $this->authorize('accept', $allocation);

        $this->allocationService->acceptAllocation($allocation);

        return redirect()->back()->with('success', 'Allocation accepted successfully.');
    }

    /**
     * Decline an allocation (beneficiary action).
     */
    public function decline(Request $request, string $id): RedirectResponse
    {
        $allocation = Allocation::findOrFail($id);

        $this->authorize('accept', $allocation);

        $this->allocationService->declineAllocation($allocation);

        return redirect()->back()->with('success', 'Allocation declined successfully.');
    }

    /**
     * Record move-in and contract signing.
     */
    public function moveIn(Request $request, string $id): RedirectResponse
    {
        $allocation = Allocation::findOrFail($id);

        $this->authorize('update', $allocation);

        $request->validate([
            'contract_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        $contractPath = $request->file('contract_file')->store('contracts', 'public');

        $this->allocationService->recordMoveIn($allocation, $contractPath);

        return redirect()->back()->with('success', 'Move-in recorded successfully.');
    }
}
