<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Services\ComplianceCheckerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceCheckController extends Controller
{
    public function __construct(
        protected ComplianceCheckerService $complianceCheckerService
    ) {}

    /**
     * Check compliance of application data.
     */
    public function checkCompliance(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'zone_id' => 'nullable|exists:zones,id',
                'lot_area_total' => 'nullable|numeric|min:0',
                'lot_area_used' => 'nullable|numeric|min:0',
                'floor_area_sqm' => 'nullable|numeric|min:0',
                'number_of_storeys' => 'nullable|integer|min:0',
                'front_setback_m' => 'nullable|numeric|min:0',
                'rear_setback_m' => 'nullable|numeric|min:0',
                'side_setback_m' => 'nullable|numeric|min:0',
                'building_footprint_sqm' => 'nullable|numeric|min:0',
                'land_use_type' => 'nullable|string',
                'building_height_m' => 'nullable|numeric|min:0',
            ]);

            $zone = null;
            if (! empty($validated['zone_id'])) {
                $zone = Zone::with('classification')->find($validated['zone_id']);
            }

            $complianceResult = $this->complianceCheckerService->checkCompliance($validated, $zone);
            $report = $this->complianceCheckerService->generateComplianceReport($complianceResult);

            return response()->json($report);
        } catch (\Exception $e) {
            \Log::error('Compliance check error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'violations' => ['An error occurred while checking compliance: '.$e->getMessage()],
                'warnings' => [],
                'compliant' => false,
                'score' => 0.0,
                'error' => true,
            ], 500);
        }
    }
}
