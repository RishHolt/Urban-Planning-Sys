<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectPhaseRequest;
use App\Http\Requests\UpdateProjectPhaseRequest;
use App\Models\InfrastructureProject;
use App\Models\ProjectPhase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectPhaseController extends Controller
{
    /**
     * Display a listing of phases for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $phases = $project->phases()
            ->orderBy('sequence_order', 'asc')
            ->get()
            ->map(function ($phase) {
                return [
                    'id' => (string) $phase->id,
                    'phase_name' => $phase->phase_name,
                    'phase_type' => $phase->phase_type,
                    'sequence_order' => $phase->sequence_order,
                    'start_date' => $phase->start_date?->format('Y-m-d'),
                    'end_date' => $phase->end_date?->format('Y-m-d'),
                    'actual_start_date' => $phase->actual_start_date?->format('Y-m-d'),
                    'actual_end_date' => $phase->actual_end_date?->format('Y-m-d'),
                    'budget' => $phase->budget,
                    'actual_cost' => $phase->actual_cost,
                    'progress_percentage' => $phase->progress_percentage,
                    'status' => $phase->status,
                    'milestones_count' => $phase->milestones()->count(),
                ];
            });

        return Inertia::render('Admin/Infrastructure/PhasesIndex', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'phases' => $phases,
        ]);
    }

    /**
     * Store a newly created phase.
     */
    public function store(StoreProjectPhaseRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            // Get the next sequence order
            $maxSequence = $project->phases()->max('sequence_order') ?? 0;
            $sequenceOrder = $maxSequence + 1;

            $phase = ProjectPhase::create(array_merge(
                $request->validated(),
                [
                    'project_id' => $project->id,
                    'sequence_order' => $sequenceOrder,
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Phase created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to create phase: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Update the specified phase.
     */
    public function update(UpdateProjectPhaseRequest $request, string $projectId, string $id): RedirectResponse
    {
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($id);

        $phase->update($request->validated());

        return redirect()->back()
            ->with('success', 'Phase updated successfully.');
    }

    /**
     * Remove the specified phase.
     */
    public function destroy(string $projectId, string $id): RedirectResponse
    {
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($id);

        $phase->delete();

        return redirect()->back()
            ->with('success', 'Phase deleted successfully.');
    }

    /**
     * Update phase status.
     */
    public function updateStatus(Request $request, string $projectId, string $id): RedirectResponse
    {
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($id);

        $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed,delayed,cancelled'],
        ]);

        $phase->update(['status' => $request->status]);

        // If marking as in_progress, set actual_start_date if not set
        if ($request->status === 'in_progress' && ! $phase->actual_start_date) {
            $phase->update(['actual_start_date' => now()]);
        }

        // If marking as completed, set actual_end_date if not set
        if ($request->status === 'completed' && ! $phase->actual_end_date) {
            $phase->update(['actual_end_date' => now()]);
        }

        return redirect()->back()
            ->with('success', 'Phase status updated successfully.');
    }

    /**
     * Update phase progress percentage.
     */
    public function updateProgress(Request $request, string $projectId, string $id): RedirectResponse
    {
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($id);

        $request->validate([
            'progress_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $phase->update(['progress_percentage' => $request->progress_percentage]);

        return redirect()->back()
            ->with('success', 'Phase progress updated successfully.');
    }
}
