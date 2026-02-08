<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectUpdateRequest;
use App\Http\Requests\UpdateProjectUpdateRequest;
use App\Models\InfrastructureProject;
use App\Models\ProjectUpdate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectUpdateController extends Controller
{
    /**
     * Display a listing of updates for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $updates = ProjectUpdate::where('project_id', $projectId)
            ->with(['updatedBy.profile'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($update) {
                return [
                    'id' => (string) $update->id,
                    'update_description' => $update->update_description,
                    'progress_percentage' => $update->progress_percentage,
                    'issues' => $update->issues,
                    'next_steps' => $update->next_steps,
                    'updated_by' => $update->updatedBy ? [
                        'id' => (string) $update->updatedBy->id,
                        'name' => $update->updatedBy->profile?->full_name ?? $update->updatedBy->email,
                    ] : null,
                    'created_at' => $update->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Infrastructure/ProjectUpdates', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'updates' => $updates,
        ]);
    }

    /**
     * Store a newly created update.
     */
    public function store(StoreProjectUpdateRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            ProjectUpdate::create(array_merge(
                $request->validated(),
                [
                    'project_id' => $project->id,
                    'updated_by' => auth()->id(),
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Project update created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to create update: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified update.
     */
    public function show(string $projectId, string $id): Response
    {
        $update = ProjectUpdate::where('project_id', $projectId)
            ->with(['project', 'updatedBy.profile'])
            ->findOrFail($id);

        return Inertia::render('Admin/Infrastructure/UpdateShow', [
            'update' => $update,
        ]);
    }

    /**
     * Update the specified update.
     */
    public function update(UpdateProjectUpdateRequest $request, string $projectId, string $id): RedirectResponse
    {
        $update = ProjectUpdate::where('project_id', $projectId)->findOrFail($id);

        $update->update($request->validated());

        return redirect()->back()
            ->with('success', 'Project update updated successfully.');
    }

    /**
     * Remove the specified update.
     */
    public function destroy(string $projectId, string $id): RedirectResponse
    {
        $update = ProjectUpdate::where('project_id', $projectId)->findOrFail($id);

        $update->delete();

        return redirect()->back()
            ->with('success', 'Project update deleted successfully.');
    }
}
