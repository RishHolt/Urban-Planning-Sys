<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRecordRequest;
use App\Models\ApplicationHistory;
use App\Models\ClearanceApplication;
use App\Models\PaymentRecord;
use App\Services\TreasuryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PaymentRecordController extends Controller
{
    public function __construct(
        protected TreasuryService $treasuryService
    ) {}

    /**
     * Display a listing of all payment records.
     */
    public function index(Request $request): Response
    {
        $query = PaymentRecord::with('clearanceApplication');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                    ->orWhere('treasury_ref', 'like', "%{$search}%")
                    ->orWhereHas('clearanceApplication', function ($q) use ($search) {
                        $q->where('reference_no', 'like', "%{$search}%")
                            ->orWhere('lot_owner', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by date range
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->whereDate('payment_date', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->whereDate('payment_date', '<=', $request->dateTo);
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate(15)
            ->through(function ($payment) {
                return [
                    'id' => (string) $payment->id,
                    'or_number' => $payment->or_number,
                    'reference_no' => $payment->clearanceApplication->reference_no,
                    'amount' => number_format($payment->amount, 2),
                    'payment_date' => $payment->payment_date->format('Y-m-d'),
                    'treasury_ref' => $payment->treasury_ref,
                    'application_id' => (string) $payment->application_id,
                ];
            });

        return Inertia::render('Admin/Clearance/PaymentRecordsIndex', [
            'payments' => $payments,
            'filters' => [
                'search' => $request->search,
                'dateFrom' => $request->dateFrom,
                'dateTo' => $request->dateTo,
            ],
        ]);
    }

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
