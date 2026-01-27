<?php

namespace App\Http\Controllers;

use App\Models\BuildingUnit;
use App\Models\EntryExitEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OccupancyDashboardController extends Controller
{
    /**
     * Get occupancy statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        // Get building_id from request, or use a default/all buildings
        $buildingId = $request->get('building_id');

        $query = BuildingUnit::query();

        if ($buildingId) {
            $query->where('building_id', $buildingId);
        }

        $units = $query->get();

        $currentOccupancy = $units->sum('current_occupant_count');
        $maxOccupancy = $units->sum('max_occupants');

        // Get last 15 entry/exit events
        $events = EntryExitEvent::query()
            ->orderBy('timestamp', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'type' => $event->type,
                    'person_id' => $event->person_id,
                    'timestamp' => $event->timestamp->toIso8601String(),
                    'device_id' => $event->device_id,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'current_occupancy' => $currentOccupancy,
                'max_occupancy' => $maxOccupancy,
                'events' => $events,
            ],
        ]);
    }
}
