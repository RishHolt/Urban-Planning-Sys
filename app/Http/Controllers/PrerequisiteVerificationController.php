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
            'tax_dec_ref_no' => ['required', 'string', 'max:50'],
            'barangay_permit_ref_no' => ['required', 'string', 'max:50'],
        ]);

        $taxDecRef = $request->input('tax_dec_ref_no');
        $barangayPermitRef = $request->input('barangay_permit_ref_no');

        // Verify Tax Declaration
        $taxDecVerification = $this->treasuryService->verifyTaxDeclaration($taxDecRef);

        // Verify Barangay Permit
        $barangayPermitVerification = $this->permitLicensingService->verifyBarangayPermit($barangayPermitRef);

        $bothVerified = $taxDecVerification['verified'] && $barangayPermitVerification['verified'];

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
                : 'Prerequisites verification failed. Please check your reference numbers.',
        ]);
    }
}
