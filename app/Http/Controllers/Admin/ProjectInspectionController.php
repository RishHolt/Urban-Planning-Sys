<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConductInspectionRequest;
use App\Http\Requests\StoreProjectInspectionRequest;
use App\Http\Requests\UpdateProjectInspectionRequest;
use App\Models\InfrastructureProject;
use App\Models\ProjectInspection;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectInspectionController extends Controller
{
    /**
     * Display a listing of inspections for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $query = ProjectInspection::where('project_id', $projectId)
            ->with(['phase', 'inspector.profile']);

        if ($request->has('inspection_type') && $request->inspection_type) {
            $query->where('inspection_type', $request->inspection_type);
        }

        if ($request->has('result') && $request->result) {
            $query->where('result', $request->result);
        }

        $inspections = $query->orderBy('scheduled_date', 'desc')
            ->get()
            ->map(function ($inspection) {
                return [
                    'id' => (string) $inspection->id,
                    'inspection_type' => $inspection->inspection_type,
                    'phase' => $inspection->phase ? [
                        'id' => (string) $inspection->phase->id,
                        'phase_name' => $inspection->phase->phase_name,
                    ] : null,
                    'inspector' => $inspection->inspector ? [
                        'id' => (string) $inspection->inspector->id,
                        'name' => $inspection->inspector->profile?->full_name ?? $inspection->inspector->email,
                    ] : null,
                    'scheduled_date' => $inspection->scheduled_date?->format('Y-m-d'),
                    'inspection_date' => $inspection->inspection_date?->format('Y-m-d'),
                    'result' => $inspection->result,
                    'findings' => $inspection->findings,
                    'deficiencies' => $inspection->deficiencies,
                ];
            });

        $inspectors = User::whereIn('role', ['admin', 'staff', 'inspector'])
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->profile?->full_name ?? $user->email,
                ];
            });

        $phases = $project->phases()->get()->map(function ($phase) {
            return [
                'id' => (string) $phase->id,
                'phase_name' => $phase->phase_name,
            ];
        });

        return Inertia::render('Admin/Infrastructure/InspectionsIndex', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'inspections' => $inspections,
            'inspectors' => $inspectors,
            'phases' => $phases,
            'filters' => $request->only(['inspection_type', 'result']),
        ]);
    }

    /**
     * Store a newly created inspection (schedule).
     */
    public function store(StoreProjectInspectionRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            $inspection = ProjectInspection::create(array_merge(
                $request->validated(),
                [
                    'project_id' => $project->id,
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Inspection scheduled successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to schedule inspection: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified inspection.
     */
    public function show(string $projectId, string $id): Response
    {
        $inspection = ProjectInspection::where('project_id', $projectId)
            ->with(['project', 'phase', 'inspector.profile', 'photos.takenBy.profile'])
            ->findOrFail($id);

        return Inertia::render('Admin/Infrastructure/InspectionShow', [
            'inspection' => $inspection,
        ]);
    }

    /**
     * Update the specified inspection.
     */
    public function update(UpdateProjectInspectionRequest $request, string $projectId, string $id): RedirectResponse
    {
        $inspection = ProjectInspection::where('project_id', $projectId)->findOrFail($id);

        $inspection->update($request->validated());

        return redirect()->back()
            ->with('success', 'Inspection updated successfully.');
    }

    /**
     * Conduct inspection (record results).
     */
    public function conduct(ConductInspectionRequest $request, string $projectId, string $id): RedirectResponse
    {
        $inspection = ProjectInspection::where('project_id', $projectId)->findOrFail($id);

        DB::beginTransaction();

        try {
            $inspection->update(array_merge(
                $request->validated(),
                [
                    'inspection_date' => $request->inspection_date ?? now(),
                    'inspected_at' => now(),
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Inspection results recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to record inspection results: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Schedule an inspection.
     */
    public function schedule(Request $request, string $projectId): RedirectResponse
    {
        $request->validate([
            'inspection_type' => ['required', 'in:pre_construction,material_inspection,progress_inspection,milestone_inspection,final_inspection,follow_up'],
            'phase_id' => ['nullable', 'exists:project_phases,id'],
            'inspector_id' => ['required', 'exists:users,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            ProjectInspection::create([
                'project_id' => $project->id,
                'phase_id' => $request->phase_id,
                'inspection_type' => $request->inspection_type,
                'inspector_id' => $request->inspector_id,
                'scheduled_date' => $request->scheduled_date,
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Inspection scheduled successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to schedule inspection: '.$e->getMessage())
                ->withInput();
        }
    }
}
