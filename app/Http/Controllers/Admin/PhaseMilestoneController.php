<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhaseMilestoneRequest;
use App\Http\Requests\UpdatePhaseMilestoneRequest;
use App\Models\InfrastructureProject;
use App\Models\PhaseMilestone;
use App\Models\ProjectPhase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PhaseMilestoneController extends Controller
{
    /**
     * Display a listing of milestones for a phase.
     */
    public function index(Request $request, string $projectId, string $phaseId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($phaseId);

        $milestones = $phase->milestones()
            ->orderBy('target_date', 'asc')
            ->get()
            ->map(function ($milestone) {
                return [
                    'id' => (string) $milestone->id,
                    'milestone_name' => $milestone->milestone_name,
                    'description' => $milestone->description,
                    'target_date' => $milestone->target_date?->format('Y-m-d'),
                    'actual_date' => $milestone->actual_date?->format('Y-m-d'),
                    'status' => $milestone->status,
                    'remarks' => $milestone->remarks,
                ];
            });

        return Inertia::render('Admin/Infrastructure/MilestonesIndex', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'phase' => [
                'id' => (string) $phase->id,
                'phase_name' => $phase->phase_name,
            ],
            'milestones' => $milestones,
        ]);
    }

    /**
     * Store a newly created milestone.
     */
    public function store(StorePhaseMilestoneRequest $request, string $projectId, string $phaseId): RedirectResponse
    {
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($phaseId);

        DB::beginTransaction();

        try {
            $milestone = PhaseMilestone::create(array_merge(
                $request->validated(),
                [
                    'phase_id' => $phase->id,
                    'status' => 'pending',
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Milestone created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to create milestone: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Update the specified milestone.
     */
    public function update(UpdatePhaseMilestoneRequest $request, string $projectId, string $phaseId, string $id): RedirectResponse
    {
        $milestone = PhaseMilestone::whereHas('phase', function ($query) use ($projectId) {
            $query->where('project_id', $projectId);
        })->findOrFail($id);

        $milestone->update($request->validated());

        return redirect()->back()
            ->with('success', 'Milestone updated successfully.');
    }

    /**
     * Remove the specified milestone.
     */
    public function destroy(string $projectId, string $phaseId, string $id): RedirectResponse
    {
        $milestone = PhaseMilestone::whereHas('phase', function ($query) use ($projectId) {
            $query->where('project_id', $projectId);
        })->findOrFail($id);

        $milestone->delete();

        return redirect()->back()
            ->with('success', 'Milestone deleted successfully.');
    }

    /**
     * Mark milestone as achieved.
     */
    public function markAchieved(Request $request, string $projectId, string $phaseId, string $id): RedirectResponse
    {
        $milestone = PhaseMilestone::whereHas('phase', function ($query) use ($projectId) {
            $query->where('project_id', $projectId);
        })->findOrFail($id);

        $request->validate([
            'actual_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $milestone->update([
            'status' => 'achieved',
            'actual_date' => $request->actual_date ?? now(),
            'remarks' => $request->remarks,
        ]);

        return redirect()->back()
            ->with('success', 'Milestone marked as achieved.');
    }

    /**
     * Reschedule milestone.
     */
    public function reschedule(Request $request, string $projectId, string $phaseId, string $id): RedirectResponse
    {
        $milestone = PhaseMilestone::whereHas('phase', function ($query) use ($projectId) {
            $query->where('project_id', $projectId);
        })->findOrFail($id);

        $request->validate([
            'target_date' => ['required', 'date'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $milestone->update([
            'status' => 'rescheduled',
            'target_date' => $request->target_date,
            'remarks' => $request->remarks,
        ]);

        return redirect()->back()
            ->with('success', 'Milestone rescheduled successfully.');
    }
}
