<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBlacklistRequest;
use App\Models\Beneficiary;
use App\Models\Blacklist;
use App\Services\BlacklistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlacklistController extends Controller
{
    public function __construct(
        protected BlacklistService $blacklistService
    ) {}

    /**
     * Display a listing of blacklisted beneficiaries.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Blacklist::class);

        $query = Blacklist::with('beneficiary');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $blacklist = $query->orderBy('blacklisted_date', 'desc')
            ->paginate(15)
            ->through(function ($entry) {
                return [
                    'id' => (string) $entry->id,
                    'beneficiary' => $entry->beneficiary->full_name,
                    'beneficiary_no' => $entry->beneficiary->beneficiary_no,
                    'reason' => $entry->reason,
                    'status' => $entry->status,
                    'blacklisted_date' => $entry->blacklisted_date->format('Y-m-d'),
                    'lifted_date' => $entry->lifted_date?->format('Y-m-d'),
                ];
            });

        return Inertia::render('Admin/Housing/BlacklistIndex', [
            'blacklist' => $blacklist,
        ]);
    }

    /**
     * Store a newly created blacklist entry.
     */
    public function store(StoreBlacklistRequest $request): RedirectResponse
    {
        $this->authorize('create', Blacklist::class);

        $beneficiary = Beneficiary::findOrFail($request->beneficiary_id);

        $this->blacklistService->addToBlacklist(
            $beneficiary,
            $request->reason,
            $request->details,
            auth()->id()
        );

        return redirect()->back()->with('success', 'Beneficiary added to blacklist successfully.');
    }

    /**
     * Lift a blacklist entry.
     */
    public function lift(Request $request, string $id): RedirectResponse
    {
        $blacklist = Blacklist::findOrFail($id);

        $this->authorize('lift', $blacklist);

        $request->validate([
            'lift_remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->blacklistService->liftBlacklist(
            $blacklist->beneficiary,
            auth()->id(),
            $request->lift_remarks
        );

        return redirect()->back()->with('success', 'Blacklist lifted successfully.');
    }
}
