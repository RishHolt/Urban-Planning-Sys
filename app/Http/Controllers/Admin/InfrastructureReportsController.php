<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BudgetTracking;
use App\Models\InfrastructureProject;
use App\Models\ProjectPhase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InfrastructureReportsController extends Controller
{
    /**
     * Display infrastructure project reports.
     */
    public function index(Request $request): Response
    {
        $query = InfrastructureProject::query();

        // Apply filters
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('project_type') && $request->project_type) {
            $query->where('project_type', $request->project_type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $projects = $query->get();

        // Project Status Report
        $projectStatusReport = [
            'total' => $projects->count(),
            'by_status' => $projects->groupBy('status')->map->count()->toArray(),
        ];

        // Budget Report
        $budgetTracking = BudgetTracking::whereIn('project_id', $projects->pluck('id'))->get();
        $budgetReport = [
            'total_allocated' => $budgetTracking->sum('allocated_amount'),
            'total_spent' => $budgetTracking->sum('spent_amount'),
            'total_remaining' => $budgetTracking->sum('remaining_amount'),
            'by_category' => $budgetTracking->groupBy('budget_category')->map(function ($items) {
                return [
                    'category' => $items->first()->budget_category,
                    'allocated' => $items->sum('allocated_amount'),
                    'spent' => $items->sum('spent_amount'),
                    'remaining' => $items->sum('remaining_amount'),
                ];
            })->values()->toArray(),
        ];

        // Progress Report
        $phases = ProjectPhase::whereIn('project_id', $projects->pluck('id'))->get();
        $averageProgress = $phases->whereNotNull('progress_percentage')->avg('progress_percentage') ?? 0;
        $onTrack = $projects->where('status', 'ongoing')->count();
        $delayed = $projects->where('status', 'delayed')->count();

        $progressReport = [
            'average_progress' => $averageProgress,
            'on_track' => $onTrack,
            'delayed' => $delayed,
            'by_phase' => $phases->groupBy('phase_type')->map(function ($items) {
                return [
                    'phase_type' => $items->first()->phase_type,
                    'average_progress' => $items->whereNotNull('progress_percentage')->avg('progress_percentage') ?? 0,
                    'count' => $items->count(),
                ];
            })->values()->toArray(),
        ];

        return Inertia::render('Admin/Infrastructure/Reports', [
            'projectStatusReport' => $projectStatusReport,
            'budgetReport' => $budgetReport,
            'progressReport' => $progressReport,
            'filters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'project_type' => $request->project_type,
                'status' => $request->status,
            ],
        ]);
    }
}
