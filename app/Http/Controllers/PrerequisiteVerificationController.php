<?php

namespace App\Http\Controllers;

use App\Services\PermitLicensingService;
use App\Services\TreasuryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrerequisiteVerificationController extends Controller
{
    public function __construct(
        protected TreasuryService $treasuryService,
        protected PermitLicensingService $permitLicensingService
    ) {}

    /**
     * Verify prerequisites before allowing application submission.
     */
    public function verify(Request $request): JsonResponse
    {
        // Bypass verification for testing
        return response()->json([
            'verified' => true,
            'tax_declaration' => [
                'verified' => true,
                'message' => 'Tax Declaration verified (TEST MODE).',
                'data' => [
                    'owner' => 'Test Owner',
                    'location' => 'Test Location',
                    'assessed_value' => 100000
                ],
            ],
            'barangay_permit' => [
                'verified' => true,
                'message' => 'Barangay Permit verified (TEST MODE).',
                'data' => [
                    'business_name' => 'Test Business',
                    'issued_date' => now()->toDateString(),
                    'expiry_date' => now()->addYear()->toDateString()
                ],
            ],
            'message' => 'All prerequisites verified (TEST MODE). You can proceed with the application.',
        ]);
    }
}
