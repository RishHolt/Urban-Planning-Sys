<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inspection;
use App\Models\IssuedClearance;
use App\Models\User;
use App\Models\ZoningApplication;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Display the main admin dashboard.
     */
    public function index(): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // KPI Stats
        $totalApplications = ZoningApplication::count();
        $pendingCount = ZoningApplication::whereIn('status', ['submitted', 'pending'])->count();
        $underReviewCount = ZoningApplication::where('status', 'under_review')->count();
        $approvedCount = ZoningApplication::where('status', 'approved')->count();
        $forInspectionCount = ZoningApplication::where('status', 'for_inspection')->count();
        $clearancesIssued = IssuedClearance::count();
        $registeredCitizens = User::where('role', 'user')->count();
        $totalInspections = Inspection::count();

        // This month stats
        $applicationsThisMonth = ZoningApplication::where('submitted_at', '>=', $startOfMonth)->count();
        $clearancesThisMonth = IssuedClearance::where('created_at', '>=', $startOfMonth)->count();
        $inspectionsThisMonth = Inspection::where('completed_at', '>=', $startOfMonth)->count();

        // Today's inspections
        $inspectionsToday = Inspection::whereDate('scheduled_date', $today)
            ->whereNull('completed_at')
            ->count();

        // Applications by status for donut chart
        $applicationsByStatus = ZoningApplication::select('status', DB::raw('count(*) as value'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => ucfirst(str_replace('_', ' ', $item->status)),
                'value' => $item->value,
            ]);

        // Weekly Trend (Last 7 Days)
        $weeklyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = ZoningApplication::whereDate('submitted_at', $date)->count();
            $weeklyTrend[] = [
                'day' => $date->format('D'),
                'count' => $count,
            ];
        }

        // Recent Applications (last 8)
        $recentApplications = ZoningApplication::with('user')
            ->latest('submitted_at')
            ->limit(8)
            ->get();

        // Today's Inspections List
        $todayInspections = Inspection::with(['clearanceApplication', 'inspector'])
            ->whereDate('scheduled_date', $today)
            ->orderBy('scheduled_date', 'asc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Home', [
            'stats' => [
                'totalApplications' => $totalApplications,
                'pendingCount' => $pendingCount,
                'underReviewCount' => $underReviewCount,
                'approvedCount' => $approvedCount,
                'forInspectionCount' => $forInspectionCount,
                'clearancesIssued' => $clearancesIssued,
                'registeredCitizens' => $registeredCitizens,
                'totalInspections' => $totalInspections,
                'applicationsThisMonth' => $applicationsThisMonth,
                'clearancesThisMonth' => $clearancesThisMonth,
                'inspectionsThisMonth' => $inspectionsThisMonth,
                'inspectionsToday' => $inspectionsToday,
                'applicationsByStatus' => $applicationsByStatus,
            ],
            'weeklyTrend' => $weeklyTrend,
            'recentApplications' => $recentApplications,
            'todayInspections' => $todayInspections,
        ]);
    }
}
