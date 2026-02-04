<?php

namespace App\Http\Controllers;

use App\Helpers\ZoneFormatter;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;

class ZoneController extends Controller
{
    /**
     * Get all active zones with geometry for frontend zone detection.
     */
    public function index(): JsonResponse
    {
        $zones = Zone::active()
            ->zoning() // Only return zoning zones, not boundaries
            ->with('classification')
            ->get()
            ->map(fn ($zone) => ZoneFormatter::format($zone, false));

        return response()->json([
            'success' => true,
            'zones' => $zones,
        ]);
    }
}
