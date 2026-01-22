<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRecordRequest;
use App\Models\ApplicationHistory;
use App\Models\ClearanceApplication;
use App\Models\PaymentRecord;
use App\Services\TreasuryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class PaymentRecordController extends Controller
{
    public function __construct(
        protected TreasuryService $treasuryService
    ) {}

    /**
     * Store a payment record for an application.
     */
    public function store(StorePaymentRecordRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Verify payment with Treasury API (mock)
        $verification = $this->treasuryService->verifyPayment($validated['or_number']);

        if (! $verification['verified']) {
            return back()->withErrors([
                'or_number' => 'Payment verification failed. Please check the OR number.',
            ]);
        }

        // Create payment record
        $paymentRecord = PaymentRecord::create([
            'application_id' => $validated['application_id'],
            'or_number' => $validated['or_number'],
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'treasury_ref' => $verification['data']['treasury_ref'] ?? null,
            'recorded_by' => Auth::id(),
            'created_at' => now(),
        ]);

        // Payment is optional/parallel - don't change status automatically
        // Status changes are handled by staff/admin during review
        $application = ClearanceApplication::findOrFail($validated['application_id']);

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => $application->status, // Keep current status
            'remarks' => 'Payment recorded. OR Number: '.$validated['or_number'],
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Payment recorded successfully.');
    }
}
