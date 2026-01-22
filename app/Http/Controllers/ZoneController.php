<?php

namespace App\Http\Controllers;

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
            ->select('id', 'code', 'name', 'geometry', 'color')
            ->get()
            ->map(function ($zone) {
                return [
                    'id' => $zone->id,
                    'code' => $zone->code,
                    'name' => $zone->name,
                    'geometry' => $zone->geometry,
                    'color' => $zone->color,
                ];
            });

        return response()->json($zones);
    }
}
