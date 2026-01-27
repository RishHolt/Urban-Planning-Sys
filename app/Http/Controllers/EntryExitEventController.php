<?php

namespace App\Http\Controllers;

use App\Events\EntryExitEventBroadcast;
use App\Http\Requests\StoreEntryExitEventRequest;
use App\Http\Requests\StorePersonCountEventRequest;
use App\Models\BuildingUnit;
use App\Models\EntryExitEvent;
use App\Models\PersonCountEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntryExitEventController extends Controller
{
    /**
     * Store a new entry/exit event.
     */
    public function store(StoreEntryExitEventRequest $request): JsonResponse
    {
        $event = EntryExitEvent::create([
            'type' => $request->type,
            'person_id' => $request->person_id,
            'timestamp' => (int) ($request->timestamp / 1000), // Convert from milliseconds to seconds (Unix timestamp)
            'device_id' => $request->device_id,
        ]);

        // Update occupancy count based on entry/exit
        // For simplicity, we'll calculate from all units
        // In a real scenario, you'd track which unit the person belongs to
        $units = BuildingUnit::query()->get();
        $currentOccupancy = $units->sum('current_occupant_count');
        $maxOccupancy = $units->sum('max_occupants');

        // Broadcast the event
        broadcast(new EntryExitEventBroadcast($event, $currentOccupancy, $maxOccupancy));

        return response()->json([
            'success' => true,
            'message' => 'Event recorded successfully',
            'data' => $event,
        ], 201);
    }

    /**
     * Get a list of entry/exit events.
     */
    public function index(Request $request): JsonResponse
    {
        $query = EntryExitEvent::query();

        if ($request->has('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('timestamp', [
                $request->start_date,
                $request->end_date,
            ]);
        }

        $events = $query->orderBy('timestamp', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    /**
     * Store a new person count event.
     */
    public function storePersonCount(StorePersonCountEventRequest $request): JsonResponse
    {
        $event = PersonCountEvent::create([
            'count' => $request->count,
            'timestamp' => (int) ($request->timestamp / 1000), // Convert from milliseconds to seconds (Unix timestamp)
            'device_id' => $request->device_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Person count event recorded successfully',
            'data' => $event,
        ], 201);
    }
}
