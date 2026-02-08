<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contractor;
use App\Models\InfrastructureProject;
use App\Models\ProjectInspection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InfrastructureDashboardController extends Controller
{
    /**
     * Display the infrastructure project coordination dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'total_projects' => InfrastructureProject::count(),
            'ongoing_projects' => InfrastructureProject::whereIn('status', ['ongoing', 'contract_signed'])->count(),
            'delayed_projects' => InfrastructureProject::where('status', 'delayed')->count(),
            'completed_projects' => InfrastructureProject::where('status', 'completed')->count(),
            'total_budget' => InfrastructureProject::sum('budget'),
            'total_spent' => InfrastructureProject::sum('actual_cost'),
            'active_contractors' => Contractor::where('is_active', true)->count(),
            'pending_inspections' => ProjectInspection::whereNull('inspection_date')
                ->where('scheduled_date', '>=', now())
                ->count(),
        ];

        // Recent projects
        $recentProjects = InfrastructureProject::with('projectManager.profile')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                $phases = $project->phases;
                $overallProgress = $phases->isEmpty() ? 0 : $phases->avg('progress_percentage') ?? 0;

                return [
                    'id' => (string) $project->id,
                    'project_code' => $project->project_code,
                    'project_name' => $project->project_name,
                    'status' => $project->status,
                    'progress_percentage' => $overallProgress,
                ];
            });

        // Upcoming inspections
        $upcomingInspections = ProjectInspection::with(['project', 'inspector.profile'])
            ->whereNull('inspection_date')
            ->where('scheduled_date', '>=', now())
            ->orderBy('scheduled_date', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($inspection) {
                return [
                    'id' => (string) $inspection->id,
                    'inspection_type' => $inspection->inspection_type,
                    'scheduled_date' => $inspection->scheduled_date?->format('Y-m-d'),
                    'project' => [
                        'id' => (string) $inspection->project->id,
                        'project_code' => $inspection->project->project_code,
                        'project_name' => $inspection->project->project_name,
                    ],
                ];
            });

        return Inertia::render('Admin/Infrastructure/Dashboard', [
            'stats' => $stats,
            'recentProjects' => $recentProjects,
            'upcomingInspections' => $upcomingInspections,
        ]);
    }
}
