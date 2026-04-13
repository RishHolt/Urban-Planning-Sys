<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ZoningApplication;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ZoningDashboardController extends Controller
{
    /**
     * Display the operational zoning dashboard.
     */
    public function index(): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Operational KPIs
        $pendingApplications = ZoningApplication::where('status', 'submitted')->count();
        $underReview = ZoningApplication::where('status', 'under_review')->count();
        $inspectionsToday = Inspection::whereDate('scheduled_date', $today)
            ->whereNull('completed_at')
            ->count();
        
        // Additional Rich Metrics
        $approvedMonth = ZoningApplication::where('status', 'approved')
            ->where('approved_at', '>=', $startOfMonth)
            ->count();
        
        $inspectionsCompletedMonth = Inspection::where('completed_at', '>=', $startOfMonth)
            ->count();

        // Weekly Trend Data (Last 7 Days)
        $weeklyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = ZoningApplication::whereDate('submitted_at', $date)->count();
            $weeklyTrend[] = [
                'day' => $date->format('D'),
                'count' => $count,
            ];
        }

        // Applications Needing Action (submitted or under_review)
        $recentApplications = ZoningApplication::with(['user', 'zone'])
            ->whereIn('status', ['submitted', 'under_review'])
            ->orderBy('submitted_at', 'asc')
            ->limit(10)
            ->get();

        // Today's Inspections List
        $todayInspections = Inspection::with(['clearanceApplication', 'inspector'])
            ->whereDate('scheduled_date', $today)
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return Inertia::render('Admin/Zoning/Dashboard', [
            'stats' => [
                'pending_applications' => $pendingApplications,
                'under_review' => $underReview,
                'inspections_today' => $inspectionsToday,
                'approved_month' => $approvedMonth,
                'inspections_month' => $inspectionsCompletedMonth,
            ],
            'weeklyTrend' => $weeklyTrend,
            'recentApplications' => $recentApplications,
            'todayInspections' => $todayInspections,
        ]);
    }
}
