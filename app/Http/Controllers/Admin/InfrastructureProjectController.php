<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInfrastructureProjectRequest;
use App\Http\Requests\UpdateInfrastructureProjectRequest;
use App\Models\InfrastructureProject;
use App\Models\User;
use App\Services\InfrastructureProjectWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InfrastructureProjectController extends Controller
{
    public function __construct(
        protected InfrastructureProjectWorkflowService $workflowService
    ) {}

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
        DB::beginTransaction();

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

            DB::commit();

            return redirect()->route('admin.infrastructure.projects.show', $project->id)
                ->with('success', 'Infrastructure project created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

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
            'phases' => function ($query) {
                $query->orderBy('sequence_order', 'asc');
            },
            'phases.milestones' => function ($query) {
                $query->orderBy('target_date', 'asc');
            },
            'documents',
            'updates.updatedBy.profile',
            'photos.takenBy.profile',
            'photos.phase',
            'photos.milestone',
            'photos.inspection',
            'contractors.contractor',
            'budgetTracking.phase',
            'inspections.inspector.profile',
            'inspections.phase',
        ])->findOrFail($id);

        // Calculate overall progress
        $phases = $project->phases;
        $overallProgress = $phases->isEmpty() ? 0 : $phases->avg('progress_percentage') ?? 0;

        // Get progress summary
        $progressSummary = $this->getProgress($project);

        return Inertia::render('Admin/Infrastructure/ProjectShow', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'sbr_reference_no' => $project->sbr_reference_no,
                'project_name' => $project->project_name,
                'project_description' => $project->project_description,
                'project_type' => $project->project_type,
                'location' => $project->location,
                'pin_lat' => $project->pin_lat,
                'pin_lng' => $project->pin_lng,
                'barangay' => $project->barangay,
                'budget' => $project->budget,
                'actual_cost' => $project->actual_cost,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'target_completion' => $project->target_completion?->format('Y-m-d'),
                'actual_completion' => $project->actual_completion?->format('Y-m-d'),
                'status' => $project->status,
                'scope_of_work' => $project->scope_of_work,
                'is_active' => $project->is_active,
                'created_at' => $project->created_at->format('Y-m-d H:i:s'),
                'project_manager' => $project->projectManager ? [
                    'id' => (string) $project->projectManager->id,
                    'name' => $project->projectManager->profile?->full_name ?? $project->projectManager->email,
                ] : null,
                'phases' => $phases->map(function ($phase) {
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
                        'milestones' => $phase->milestones->map(function ($milestone) {
                            return [
                                'id' => (string) $milestone->id,
                                'milestone_name' => $milestone->milestone_name,
                                'description' => $milestone->description,
                                'target_date' => $milestone->target_date?->format('Y-m-d'),
                                'actual_date' => $milestone->actual_date?->format('Y-m-d'),
                                'status' => $milestone->status,
                                'remarks' => $milestone->remarks,
                            ];
                        }),
                    ];
                }),
                'documents' => $project->documents->map(function ($document) {
                    return [
                        'id' => (string) $document->id,
                        'document_type' => $document->document_type,
                        'file_name' => $document->file_name,
                        'file_path' => $document->file_path,
                        'file_type' => $document->file_type,
                        'file_size' => $document->file_size,
                        'uploaded_at' => $document->uploaded_at?->format('Y-m-d H:i:s'),
                    ];
                }),
                'updates' => $project->updates->map(function ($update) {
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
                }),
                'photos' => $project->photos->map(function ($photo) {
                    return [
                        'id' => (string) $photo->id,
                        'photo_path' => $photo->photo_path,
                        'photo_description' => $photo->photo_description,
                        'photo_category' => $photo->photo_category,
                        'taken_at' => $photo->taken_at?->format('Y-m-d H:i:s'),
                        'phase' => $photo->phase ? [
                            'id' => (string) $photo->phase->id,
                            'phase_name' => $photo->phase->phase_name,
                        ] : null,
                        'milestone' => $photo->milestone ? [
                            'id' => (string) $photo->milestone->id,
                            'milestone_name' => $photo->milestone->milestone_name,
                        ] : null,
                        'inspection' => $photo->inspection ? [
                            'id' => (string) $photo->inspection->id,
                            'inspection_type' => $photo->inspection->inspection_type,
                        ] : null,
                        'taken_by' => $photo->takenBy ? [
                            'id' => (string) $photo->takenBy->id,
                            'name' => $photo->takenBy->profile?->full_name ?? $photo->takenBy->email,
                        ] : null,
                    ];
                }),
                'contractors' => $project->contractors->map(function ($projectContractor) {
                    return [
                        'id' => (string) $projectContractor->id,
                        'contractor' => [
                            'id' => (string) $projectContractor->contractor->id,
                            'contractor_code' => $projectContractor->contractor->contractor_code,
                            'company_name' => $projectContractor->contractor->company_name,
                            'contact_person' => $projectContractor->contractor->contact_person,
                        ],
                        'role' => $projectContractor->role,
                        'contract_amount' => $projectContractor->contract_amount,
                        'contract_start_date' => $projectContractor->contract_start_date?->format('Y-m-d'),
                        'contract_end_date' => $projectContractor->contract_end_date?->format('Y-m-d'),
                        'status' => $projectContractor->status,
                        'remarks' => $projectContractor->remarks,
                    ];
                }),
                'budgetTracking' => $project->budgetTracking->map(function ($budget) {
                    return [
                        'id' => (string) $budget->id,
                        'phase' => $budget->phase ? [
                            'id' => (string) $budget->phase->id,
                            'phase_name' => $budget->phase->phase_name,
                        ] : null,
                        'budget_category' => $budget->budget_category,
                        'allocated_amount' => $budget->allocated_amount,
                        'spent_amount' => $budget->spent_amount,
                        'remaining_amount' => $budget->remaining_amount,
                        'description' => $budget->description,
                        'year' => $budget->year,
                        'quarter' => $budget->quarter,
                    ];
                }),
                'inspections' => $project->inspections->map(function ($inspection) {
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
                }),
                'overall_progress' => $overallProgress,
                'progress_summary' => $progressSummary,
            ],
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

    /**
     * Update project status with workflow validation.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($id);

        $request->validate([
            'status' => ['required', 'in:planning,approved,bidding,contract_signed,ongoing,suspended,delayed,completed,cancelled'],
        ]);

        try {
            $this->workflowService->updateProjectStatus($project, $request->status);

            return redirect()->back()
                ->with('success', 'Project status updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update project status: '.$e->getMessage());
        }
    }

    /**
     * Get project timeline.
     */
    public function getTimeline(string $id): Response
    {
        $project = InfrastructureProject::with([
            'phases.milestones',
            'updates.updatedBy.profile',
            'inspections.inspector.profile',
        ])->findOrFail($id);

        $timeline = collect();

        // Add phases
        foreach ($project->phases as $phase) {
            $timeline->push([
                'type' => 'phase',
                'date' => $phase->actual_start_date ?? $phase->start_date,
                'title' => $phase->phase_name,
                'description' => 'Phase started',
                'status' => $phase->status,
            ]);

            if ($phase->actual_end_date) {
                $timeline->push([
                    'type' => 'phase_complete',
                    'date' => $phase->actual_end_date,
                    'title' => $phase->phase_name.' Completed',
                    'description' => 'Phase completed',
                    'status' => 'completed',
                ]);
            }

            // Add milestones
            foreach ($phase->milestones as $milestone) {
                if ($milestone->actual_date) {
                    $timeline->push([
                        'type' => 'milestone',
                        'date' => $milestone->actual_date,
                        'title' => $milestone->milestone_name,
                        'description' => $milestone->description,
                        'status' => $milestone->status,
                    ]);
                }
            }
        }

        // Add updates
        foreach ($project->updates as $update) {
            $timeline->push([
                'type' => 'update',
                'date' => $update->created_at,
                'title' => 'Project Update',
                'description' => $update->update_description,
                'updated_by' => $update->updatedBy ? [
                    'id' => (string) $update->updatedBy->id,
                    'name' => $update->updatedBy->profile?->full_name ?? $update->updatedBy->email,
                ] : null,
            ]);
        }

        // Add inspections
        foreach ($project->inspections as $inspection) {
            if ($inspection->inspection_date) {
                $timeline->push([
                    'type' => 'inspection',
                    'date' => $inspection->inspection_date,
                    'title' => ucfirst(str_replace('_', ' ', $inspection->inspection_type)).' Inspection',
                    'description' => $inspection->findings,
                    'result' => $inspection->result,
                ]);
            }
        }

        // Sort by date
        $timeline = $timeline->sortBy('date')->values();

        return response()->json([
            'timeline' => $timeline,
        ]);
    }

    /**
     * Get project progress summary.
     */
    public function getProgress(InfrastructureProject $project): array
    {
        $phases = $project->phases;
        $totalPhases = $phases->count();
        $completedPhases = $phases->where('status', 'completed')->count();

        $totalMilestones = 0;
        $achievedMilestones = 0;

        foreach ($phases as $phase) {
            $milestones = $phase->milestones;
            $totalMilestones += $milestones->count();
            $achievedMilestones += $milestones->where('status', 'achieved')->count();
        }

        $overallProgress = $phases->isEmpty() ? 0 : $phases->avg('progress_percentage') ?? 0;

        return [
            'overall_progress' => round($overallProgress, 2),
            'phases' => [
                'total' => $totalPhases,
                'completed' => $completedPhases,
                'in_progress' => $phases->where('status', 'in_progress')->count(),
                'pending' => $phases->where('status', 'pending')->count(),
            ],
            'milestones' => [
                'total' => $totalMilestones,
                'achieved' => $achievedMilestones,
                'pending' => $totalMilestones - $achievedMilestones,
            ],
            'budget' => [
                'allocated' => $project->budget,
                'spent' => $project->actual_cost,
                'remaining' => $project->budget - $project->actual_cost,
                'percentage' => $project->budget > 0 ? round(($project->actual_cost / $project->budget) * 100, 2) : 0,
            ],
        ];
    }
}
