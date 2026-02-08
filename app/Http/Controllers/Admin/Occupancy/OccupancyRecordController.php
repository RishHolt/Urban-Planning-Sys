<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyRecord;
use App\Models\Occupant;
use App\Services\ViolationDetectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OccupancyRecordController extends Controller
{
    public function __construct(
        protected ?ViolationDetectionService $violationService = null
    ) {
        // Initialize service if not provided (for dependency injection)
        if ($this->violationService === null) {
            $this->violationService = app(ViolationDetectionService::class);
        }
    }

    /**
     * Display a listing of occupancy records.
     */
    public function index(Request $request): Response
    {
        $query = OccupancyRecord::with(['building', 'unit', 'recordedBy', 'occupants']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('building', function ($q) use ($search) {
                    $q->where('building_code', 'like', "%{$search}%")
                        ->orWhere('building_name', 'like', "%{$search}%");
                })
                    ->orWhereHas('unit', function ($q) use ($search) {
                        $q->where('unit_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('occupants', function ($q) use ($search) {
                        $q->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by record type
        if ($request->has('record_type') && $request->record_type) {
            $query->where('record_type', $request->record_type);
        }

        // Filter by compliance status
        if ($request->has('compliance_status') && $request->compliance_status) {
            $query->where('compliance_status', $request->compliance_status);
        }

        // Filter by building
        if ($request->has('building_id') && $request->building_id) {
            $query->where('building_id', $request->building_id);
        }

        $records = $query->latest()->paginate(15)->withQueryString();

        $buildings = Building::where('is_active', true)
            ->orderBy('building_name')
            ->get(['id', 'building_code', 'building_name']);

        return Inertia::render('Admin/Occupancy/Records/RecordsIndex', [
            'records' => $records,
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'record_type', 'compliance_status', 'building_id']),
        ]);
    }

    /**
     * Show the form for creating a new occupancy record (move-in).
     */
    public function create(Request $request): Response
    {
        $buildings = Building::where('is_active', true)
            ->orderBy('building_name')
            ->get(['id', 'building_code', 'building_name']);

        $units = [];
        if ($request->has('building_id')) {
            $units = BuildingUnit::where('building_id', $request->building_id)
                ->orderBy('unit_no')
                ->get(['id', 'unit_no', 'status']);
        }

        return Inertia::render('Admin/Occupancy/Records/RecordForm', [
            'buildings' => $buildings,
            'units' => $units,
            'building_id' => $request->get('building_id'),
            'unit_id' => $request->get('unit_id'),
        ]);
    }

    /**
     * Store a newly created occupancy record (move-in).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'building_id' => ['required', 'exists:BUILDINGS,id'],
            'unit_id' => ['nullable', 'exists:BUILDING_UNITS,id'],
            'record_type' => ['required', 'in:move_in,move_out,transfer,renewal,update'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'occupancy_type' => ['required', 'in:owner_occupied,rented,leased,commercial_tenant'],
            'purpose_of_use' => ['nullable', 'string'],
            'compliance_status' => ['required', 'in:compliant,non_compliant,pending_review,conditional'],
            'remarks' => ['nullable', 'string'],
            'occupants' => ['required', 'array', 'min:1'],
            'occupants.*.full_name' => ['required', 'string', 'max:150'],
            'occupants.*.contact_number' => ['nullable', 'string', 'max:50'],
            'occupants.*.email' => ['nullable', 'email', 'max:255'],
            'occupants.*.relationship_to_owner' => ['required', 'in:owner,tenant,family_member,authorized_occupant'],
            'occupants.*.move_in_date' => ['required', 'date'],
            'occupants.*.is_primary_occupant' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $validated['recorded_by'] = $request->user()->id;
            $occupants = $validated['occupants'];
            unset($validated['occupants']);

            $record = OccupancyRecord::create($validated);

            // Create occupants
            foreach ($occupants as $occupantData) {
                $occupantData['occupancy_record_id'] = $record->id;
                Occupant::create($occupantData);
            }

            // Update unit status and occupant count if unit_id is provided
            if ($validated['unit_id'] && $validated['record_type'] === 'move_in') {
                $unit = BuildingUnit::find($validated['unit_id']);
                if ($unit) {
                    $unit->update([
                        'status' => 'occupied',
                        'current_occupant_count' => count($occupants),
                        'occupancy_start_date' => $validated['start_date'],
                        'current_occupant_name' => $occupants[0]['full_name'] ?? null,
                    ]);

                    // Check for overcrowding violation
                    if ($unit->isOvercrowded()) {
                        $this->violationService->detectOvercrowding($unit, $record);
                    }
                }
            }
        });

        return redirect()->route('admin.occupancy.records.index')
            ->with('success', 'Occupancy record created successfully.');
    }

    /**
     * Display the specified occupancy record.
     */
    public function show(OccupancyRecord $record): Response
    {
        $record->load([
            'building',
            'unit',
            'recordedBy',
            'occupants',
            'history.updatedBy',
        ]);

        return Inertia::render('Admin/Occupancy/Records/RecordShow', [
            'record' => $record,
        ]);
    }

    /**
     * Record move-out.
     */
    public function moveOut(Request $request, OccupancyRecord $record): RedirectResponse
    {
        $validated = $request->validate([
            'end_date' => ['required', 'date', 'after_or_equal:'.$record->start_date],
            'remarks' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($record, $validated) {
            $record->update([
                'end_date' => $validated['end_date'],
                'remarks' => $validated['remarks'] ?? $record->remarks,
            ]);

            // Update occupants move_out_date
            $record->occupants()->update([
                'move_out_date' => $validated['end_date'],
            ]);

            // Update unit status if unit_id is provided
            if ($record->unit_id) {
                $unit = BuildingUnit::find($record->unit_id);
                if ($unit) {
                    $unit->update([
                        'status' => 'vacant',
                        'current_occupant_count' => 0,
                        'current_occupant_name' => null,
                        'occupancy_start_date' => null,
                    ]);
                }
            }
        });

        return redirect()->route('admin.occupancy.records.show', $record)
            ->with('success', 'Move-out recorded successfully.');
    }
}
