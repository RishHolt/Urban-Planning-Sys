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

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard.
     */
    public function index(): Response
    {
        // KPI Data
        $totalApplications = ZoningApplication::count();
        $totalInspections = Inspection::count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalUsers = User::where('role', 'user')->count();
        $clearancesIssued = IssuedClearance::count();

        // Average Processing Time (in days)
        $avgProcessingTime = ZoningApplication::whereIn('status', ['approved', 'rejected'])
            ->whereNotNull('submitted_at')
            ->where(function ($query) {
                $query->whereNotNull('processed_at')->orWhereNotNull('approved_at');
            })
            ->select(DB::raw('AVG(DATEDIFF(COALESCE(processed_at, approved_at), submitted_at)) as avg_days'))
            ->first()
            ->avg_days ?? 0;

        // Applications by Status (Pie Chart)
        $applicationsByStatus = ZoningApplication::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => ucfirst(str_replace('_', ' ', $item->status)),
                'value' => $item->total,
            ]);

        // Applications by Project Type (Bar Chart)
        $applicationsByProjectType = ZoningApplication::select('project_type', DB::raw('count(*) as total'))
            ->groupBy('project_type')
            ->get()
            ->map(fn($item) => [
                'name' => $item->project_type ?? 'Other',
                'value' => $item->total,
            ]);

        // Applications by Land Use Type
        $applicationsByLandUse = ZoningApplication::select('land_use_type', DB::raw('count(*) as total'))
            ->whereNotNull('land_use_type')
            ->groupBy('land_use_type')
            ->orderBy('total', 'desc')
            ->get()
            ->map(fn($item) => [
                'name' => ucfirst(str_replace('_', ' ', $item->land_use_type)),
                'total' => $item->total,
            ]);

        // Monthly Application Volume (Area Chart - last 6 months)
        $monthlyApplications = ZoningApplication::select(
                DB::raw('DATE_FORMAT(submitted_at, "%Y-%m") as month'),
                DB::raw('count(*) as total')
            )
            ->where('submitted_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => Carbon::parse($item->month)->format('M Y'),
                'total' => $item->total,
            ]);

        // Monthly Clearances Issued
        $monthlyClearances = IssuedClearance::select(
                DB::raw('DATE_FORMAT(issue_date, "%Y-%m") as month'),
                DB::raw('count(*) as total')
            )
            ->where('issue_date', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => Carbon::parse($item->month)->format('M Y'),
                'total' => $item->total,
            ]);

        // Geographic Distribution (Top Barangays)
        $barangayDistribution = ZoningApplication::select('barangay', DB::raw('count(*) as total'))
            ->whereNotNull('barangay')
            ->groupBy('barangay')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'name' => $item->barangay,
                'total' => $item->total,
            ]);

        // Inspections by Result (Bar Chart)
        $inspectionsByResult = Inspection::select('result', DB::raw('count(*) as total'))
            ->groupBy('result')
            ->get()
            ->map(fn($item) => [
                'name' => ucfirst($item->result ?? 'Pending'),
                'total' => $item->total,
            ]);

        // Approval Rate
        $approvedCount = ZoningApplication::where('status', 'approved')->count();
        $rejectedCount = ZoningApplication::where('status', 'rejected')->count();
        $processedTotal = $approvedCount + $rejectedCount;
        $approvalRate = $processedTotal > 0 ? round(($approvedCount / $processedTotal) * 100, 1) : 0;

        // Recent Activity
        $recentApplications = ZoningApplication::with('user')
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Analytics', [
            'stats' => [
                'applications' => [
                    'total' => $totalApplications,
                    'byStatus' => $applicationsByStatus,
                    'byProjectType' => $applicationsByProjectType,
                    'byLandUse' => $applicationsByLandUse,
                    'monthly' => $monthlyApplications,
                    'byBarangay' => $barangayDistribution,
                    'avgProcessingTime' => round($avgProcessingTime, 1),
                    'approvalRate' => $approvalRate,
                ],
                'inspections' => [
                    'total' => $totalInspections,
                    'byResult' => $inspectionsByResult,
                ],
                'clearances' => [
                    'total' => $clearancesIssued,
                    'monthly' => $monthlyClearances,
                ],
                'users' => [
                    'admins' => $totalAdmins,
                    'normal' => $totalUsers,
                ],
            ],
            'recentApplications' => $recentApplications,
        ]);
    }
}
