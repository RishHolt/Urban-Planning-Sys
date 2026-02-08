<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingUnit;
use App\Models\OccupancyComplaint;
use App\Models\OccupancyInspection;
use App\Models\OccupancyRecord;
use App\Models\Violation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OccupancyDashboardController extends Controller
{
    /**
     * Display the occupancy monitoring dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'total_buildings' => Building::count(),
            'total_units' => BuildingUnit::count(),
            'occupied_units' => BuildingUnit::where('status', 'occupied')->count(),
            'vacant_units' => BuildingUnit::where('status', 'vacant')->count(),
            'active_complaints' => OccupancyComplaint::whereIn('status', ['open', 'assigned', 'investigated'])->count(),
            'open_violations' => Violation::whereIn('status', ['open', 'under_review'])->count(),
            'upcoming_inspections' => OccupancyInspection::where('scheduled_date', '>=', now())
                ->whereNull('inspection_date')
                ->count(),
            'overcrowded_units' => BuildingUnit::whereRaw('current_occupant_count > max_occupants')
                ->whereNotNull('max_occupants')
                ->count(),
        ];

        // Recent activities
        $recentRecords = OccupancyRecord::with(['building', 'unit', 'recordedBy'])
            ->latest()
            ->limit(10)
            ->get();

        $recentInspections = OccupancyInspection::with(['building', 'unit', 'inspector'])
            ->latest()
            ->limit(10)
            ->get();

        $recentComplaints = OccupancyComplaint::with(['building', 'unit'])
            ->latest()
            ->limit(10)
            ->get();

        $recentViolations = Violation::with(['building', 'unit'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Occupancy/Dashboard', [
            'stats' => $stats,
            'recentRecords' => $recentRecords,
            'recentInspections' => $recentInspections,
            'recentComplaints' => $recentComplaints,
            'recentViolations' => $recentViolations,
        ]);
    }
}
