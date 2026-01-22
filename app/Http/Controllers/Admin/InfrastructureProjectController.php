<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInfrastructureProjectRequest;
use App\Http\Requests\UpdateInfrastructureProjectRequest;
use App\Models\InfrastructureProject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InfrastructureProjectController extends Controller
{
    /**
     * Display a listing of infrastructure projects.
     */
    public function index(Request $request): Response
    {
        $query = InfrastructureProject::with('projectManager');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('project_code', 'like', "%{$search}%")
                    ->orWhere('project_name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('sbr_reference_no', 'like', "%{$search}%");
            });
        }

        // Filter by project type
        if ($request->has('project_type') && $request->project_type) {
            $query->where('project_type', $request->project_type);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $projects = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($project) {
                return [
                    'id' => (string) $project->id,
                    'projectCode' => $project->project_code,
                    'projectName' => $project->project_name,
                    'projectType' => $project->project_type,
                    'location' => $project->location,
                    'status' => $project->status,
                    'budget' => $project->budget,
                    'actualCost' => $project->actual_cost,
                    'targetCompletion' => $project->target_completion?->format('Y-m-d'),
                    'projectManager' => $project->projectManager ? [
                        'id' => (string) $project->projectManager->id,
                        'name' => $project->projectManager->profile?->full_name ?? $project->projectManager->email,
                    ] : null,
                    'createdAt' => $project->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Infrastructure/ProjectsIndex', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'project_type', 'status', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new infrastructure project.
     */
    public function create(): Response
    {
        $projectManagers = User::whereIn('role', ['admin', 'staff', 'project_manager'])
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->profile?->full_name ?? $user->email,
                ];
            });

        return Inertia::render('Admin/Infrastructure/ProjectForm', [
            'projectManagers' => $projectManagers,
        ]);
    }

    /**
     * Store a newly created infrastructure project.
     */
    public function store(StoreInfrastructureProjectRequest $request): RedirectResponse
    {
        DB::connection('ipc_db')->beginTransaction();

        try {
            // Generate project code
            $year = now()->year;
            $lastProject = InfrastructureProject::whereYear('created_at', $year)
                ->orderBy('id', 'desc')
                ->first();

            $sequence = $lastProject ? (int) Str::afterLast($lastProject->project_code, '-') + 1 : 1;
            $projectCode = sprintf('IPC-%d-%05d', $year, $sequence);

            $project = InfrastructureProject::create(array_merge(
                $request->validated(),
                ['project_code' => $projectCode]
            ));

            DB::connection('ipc_db')->commit();

            return redirect()->route('admin.infrastructure.projects.show', $project->id)
                ->with('success', 'Infrastructure project created successfully.');
        } catch (\Exception $e) {
            DB::connection('ipc_db')->rollBack();

            return redirect()->back()
                ->with('error', 'Failed to create infrastructure project: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified infrastructure project.
     */
    public function show(string $id): Response
    {
        $project = InfrastructureProject::with([
            'projectManager.profile',
            'phases.milestones',
            'documents',
            'updates.updatedBy.profile',
            'photos.takenBy.profile',
            'contractors.contractor',
            'budgetTracking',
            'inspections.inspector.profile',
        ])->findOrFail($id);

        return Inertia::render('Admin/Infrastructure/ProjectShow', [
            'project' => $project,
        ]);
    }

    /**
     * Show the form for editing the specified infrastructure project.
     */
    public function edit(string $id): Response
    {
        $project = InfrastructureProject::findOrFail($id);

        $projectManagers = User::whereIn('role', ['admin', 'staff', 'project_manager'])
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->profile?->full_name ?? $user->email,
                ];
            });

        return Inertia::render('Admin/Infrastructure/ProjectForm', [
            'project' => $project,
            'projectManagers' => $projectManagers,
        ]);
    }

    /**
     * Update the specified infrastructure project.
     */
    public function update(UpdateInfrastructureProjectRequest $request, string $id): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($id);
        $project->update($request->validated());

        return redirect()->route('admin.infrastructure.projects.show', $project->id)
            ->with('success', 'Infrastructure project updated successfully.');
    }

    /**
     * Remove the specified infrastructure project.
     */
    public function destroy(string $id): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($id);
        $project->update(['is_active' => false]);

        return redirect()->route('admin.infrastructure.projects.index')
            ->with('success', 'Infrastructure project deactivated successfully.');
    }
}
