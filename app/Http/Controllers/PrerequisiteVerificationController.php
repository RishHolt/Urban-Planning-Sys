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
        $validated = $request->validate([
            'tax_dec_ref_no' => 'required|string',
            'barangay_permit_ref_no' => 'required|string',
        ]);

        $taxDecResult = $this->treasuryService->verifyTaxDeclaration($validated['tax_dec_ref_no']);
        $barangayPermitResult = $this->permitLicensingService->verifyBarangayPermit($validated['barangay_permit_ref_no']);

        $allVerified = $taxDecResult['verified'] && $barangayPermitResult['verified'];

        return response()->json([
            'verified' => $allVerified,
            'tax_declaration' => $taxDecResult,
            'barangay_permit' => $barangayPermitResult,
            'message' => $allVerified 
                ? 'All prerequisites verified successfully. You can proceed with the application.'
                : 'Some prerequisites could not be verified. Please check the reference numbers.',
        ]);
    }
}
