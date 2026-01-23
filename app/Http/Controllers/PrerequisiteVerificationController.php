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
        $request->validate([
            'tax_dec_ref_no' => ['nullable', 'string', 'max:50'],
            'barangay_permit_ref_no' => ['nullable', 'string', 'max:50'],
        ]);

        $taxDecRef = $request->input('tax_dec_ref_no');
        $barangayPermitRef = $request->input('barangay_permit_ref_no');

        // Verify Tax Declaration if provided
        $taxDecVerification = $taxDecRef 
            ? $this->treasuryService->verifyTaxDeclaration($taxDecRef)
            : ['verified' => false, 'message' => 'Tax Declaration reference number is required.', 'data' => null];

        // Verify Barangay Permit if provided
        $barangayPermitVerification = $barangayPermitRef
            ? $this->permitLicensingService->verifyBarangayPermit($barangayPermitRef)
            : ['verified' => false, 'message' => 'Barangay Permit reference number is required.', 'data' => null];

        $bothVerified = ($taxDecRef && $taxDecVerification['verified']) && 
                        ($barangayPermitRef && $barangayPermitVerification['verified']);

        return response()->json([
            'verified' => $bothVerified,
            'tax_declaration' => [
                'verified' => $taxDecVerification['verified'],
                'message' => $taxDecVerification['message'],
                'data' => $taxDecVerification['data'] ?? null,
            ],
            'barangay_permit' => [
                'verified' => $barangayPermitVerification['verified'],
                'message' => $barangayPermitVerification['message'],
                'data' => $barangayPermitVerification['data'] ?? null,
            ],
            'message' => $bothVerified
                ? 'All prerequisites verified. You can proceed with the application.'
                : 'Please provide and verify all required reference numbers.',
        ]);
    }
}
