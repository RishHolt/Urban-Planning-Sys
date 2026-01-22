<?php

namespace App\Http\Controllers;

use App\Models\HousingProject;
use App\Models\HousingUnit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HousingUnitController extends Controller
{
    /**
     * Display a listing of units for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = HousingProject::findOrFail($projectId);

        $this->authorize('view', $project);

        $query = HousingUnit::where('project_id', $projectId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $units = $query->orderBy('unit_no', 'asc')
            ->paginate(15)
            ->through(function ($unit) {
                return [
                    'id' => (string) $unit->id,
                    'unit_no' => $unit->unit_no,
                    'block_no' => $unit->block_no,
                    'lot_no' => $unit->lot_no,
                    'unit_type' => $unit->unit_type,
                    'floor_area_sqm' => $unit->floor_area_sqm,
                    'status' => $unit->status,
                ];
            });

        return Inertia::render('Admin/Housing/UnitsIndex', [
            'project' => $project,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request, string $projectId): RedirectResponse
    {
        $project = HousingProject::findOrFail($projectId);

        $this->authorize('update', $project);

        $request->validate([
            'unit_no' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) {
                    $exists = DB::connection('hbr_db')
                        ->table('housing_units')
                        ->where('unit_no', $value)
                        ->exists();

                    if ($exists) {
                        $fail('The unit number has already been taken.');
                    }
                },
            ],
            'block_no' => ['nullable', 'string', 'max:50'],
            'lot_no' => ['nullable', 'string', 'max:50'],
            'floor_number' => ['nullable', 'integer', 'min:0'],
            'unit_type' => ['required', 'in:single_detached,duplex,rowhouse,apartment,condominium'],
            'floor_area_sqm' => ['required', 'numeric', 'min:0'],
        ]);

        HousingUnit::create([
            'project_id' => $projectId,
            'unit_no' => $request->unit_no,
            'block_no' => $request->block_no,
            'lot_no' => $request->lot_no,
            'floor_number' => $request->floor_number,
            'unit_type' => $request->unit_type,
            'floor_area_sqm' => $request->floor_area_sqm,
            'status' => 'available',
        ]);

        // Update project unit counts
        $project->increment('total_units');
        $project->increment('available_units');

        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, string $projectId, string $id): RedirectResponse
    {
        $unit = HousingUnit::findOrFail($id);

        $this->authorize('update', $unit->project);

        $request->validate([
            'status' => ['sometimes', 'in:available,reserved,allocated,occupied,maintenance'],
        ]);

        $oldStatus = $unit->status;
        $unit->update($request->only(['status']));

        // Update project unit counts if status changed
        if ($oldStatus !== $unit->status) {
            $project = $unit->project;

            // Decrement old status count
            if ($oldStatus === 'available') {
                $project->decrement('available_units');
            } elseif ($oldStatus === 'allocated') {
                $project->decrement('allocated_units');
            } elseif ($oldStatus === 'occupied') {
                $project->decrement('occupied_units');
            }

            // Increment new status count
            if ($unit->status === 'available') {
                $project->increment('available_units');
            } elseif ($unit->status === 'allocated') {
                $project->increment('allocated_units');
            } elseif ($unit->status === 'occupied') {
                $project->increment('occupied_units');
            }
        }

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }
}
