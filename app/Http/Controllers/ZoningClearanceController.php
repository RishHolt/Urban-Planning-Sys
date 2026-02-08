<?php

namespace App\Http\Controllers;

use App\Services\ZoningClearanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoningClearanceController extends Controller
{
    public function __construct(
        protected ZoningClearanceService $clearanceService
    ) {}

    /**
     * Verify a zoning clearance number.
     */
    public function verify(Request $request, string $clearanceNo): JsonResponse
    {
        $clearance = $this->clearanceService->getClearanceDetails($clearanceNo);

        if (! $clearance) {
            return response()->json([
                'valid' => false,
                'message' => 'Zoning clearance number not found.',
            ], 404);
        }

        $isValid = $this->clearanceService->verifyClearance($clearanceNo);

        if (! $isValid) {
            $reason = 'Zoning clearance is not active.';
            if ($clearance->status !== 'active') {
                $reason = "Zoning clearance status is: {$clearance->status}.";
            } elseif ($clearance->valid_until && $clearance->valid_until->isPast()) {
                $reason = 'Zoning clearance has expired.';
            }

            return response()->json([
                'valid' => false,
                'message' => $reason,
                'clearance' => [
                    'clearance_no' => $clearance->clearance_no,
                    'status' => $clearance->status,
                    'issue_date' => $clearance->issue_date?->format('Y-m-d'),
                    'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                ],
            ], 200);
        }

        $application = $clearance->clearanceApplication;

        return response()->json([
            'valid' => true,
            'message' => 'Zoning clearance is valid and active.',
            'clearance' => [
                'clearance_no' => $clearance->clearance_no,
                'status' => $clearance->status,
                'issue_date' => $clearance->issue_date?->format('Y-m-d'),
                'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                'application' => $application ? [
                    'reference_no' => $application->reference_no,
                    'lot_address' => $application->lot_address,
                    'pin_lat' => $application->pin_lat,
                    'pin_lng' => $application->pin_lng,
                    'province' => $application->province,
                    'municipality' => $application->municipality,
                    'barangay' => $application->barangay,
                    'street_name' => $application->street_name,
                ] : null,
            ],
        ]);
    }
}
