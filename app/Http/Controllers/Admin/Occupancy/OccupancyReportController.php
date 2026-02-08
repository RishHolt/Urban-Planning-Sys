<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\BuildingUnit;
use App\Models\OccupancyRecord;
use App\Models\Violation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class OccupancyReportController extends Controller
{
    /**
     * Display the reports index page.
     */
    public function index(): InertiaResponse
    {
        return Inertia::render('Admin/Occupancy/Reports/ReportsIndex');
    }

    /**
     * Generate occupancy summary report.
     */
    public function occupancy(Request $request): InertiaResponse
    {
        $filters = $request->only(['building_type', 'date_from', 'date_to']);

        $query = BuildingUnit::with('building');

        if ($request->has('building_type') && $request->building_type) {
            $query->whereHas('building', function ($q) use ($request) {
                $q->where('building_type', $request->building_type);
            });
        }

        $units = $query->get();

        $summary = [
            'total_units' => $units->count(),
            'occupied' => $units->where('status', 'occupied')->count(),
            'vacant' => $units->where('status', 'vacant')->count(),
            'overcrowded' => $units->filter(fn ($unit) => $unit->isOvercrowded())->count(),
            'by_type' => $units->groupBy('unit_type')->map->count(),
            'by_building_type' => $units->groupBy('building.building_type')->map->count(),
        ];

        return Inertia::render('Admin/Occupancy/Reports/OccupancyReport', [
            'summary' => $summary,
            'filters' => $filters,
        ]);
    }

    /**
     * Generate compliance report.
     */
    public function compliance(Request $request): InertiaResponse
    {
        $filters = $request->only(['building_id', 'date_from', 'date_to']);

        $query = OccupancyRecord::with(['building', 'unit']);

        if ($request->has('building_id') && $request->building_id) {
            $query->where('building_id', $request->building_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('start_date', '<=', $request->date_to);
        }

        $records = $query->get();

        $summary = [
            'total_records' => $records->count(),
            'compliant' => $records->where('compliance_status', 'compliant')->count(),
            'non_compliant' => $records->where('compliance_status', 'non_compliant')->count(),
            'pending_review' => $records->where('compliance_status', 'pending_review')->count(),
            'conditional' => $records->where('compliance_status', 'conditional')->count(),
            'by_occupancy_type' => $records->groupBy('occupancy_type')->map->count(),
        ];

        return Inertia::render('Admin/Occupancy/Reports/ComplianceReport', [
            'summary' => $summary,
            'filters' => $filters,
        ]);
    }

    /**
     * Generate violations report.
     */
    public function violations(Request $request): InertiaResponse
    {
        $filters = $request->only(['status', 'violation_type', 'severity', 'date_from', 'date_to']);

        $query = Violation::with(['building', 'unit']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('violation_type') && $request->violation_type) {
            $query->where('violation_type', $request->violation_type);
        }

        if ($request->has('severity') && $request->severity) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('violation_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('violation_date', '<=', $request->date_to);
        }

        $violations = $query->get();

        $summary = [
            'total' => $violations->count(),
            'open' => $violations->whereIn('status', ['open', 'under_review'])->count(),
            'resolved' => $violations->where('status', 'resolved')->count(),
            'by_type' => $violations->groupBy('violation_type')->map->count(),
            'by_severity' => $violations->groupBy('severity')->map->count(),
            'total_fines' => $violations->sum('fine_amount'),
        ];

        return Inertia::render('Admin/Occupancy/Reports/ViolationsReport', [
            'summary' => $summary,
            'violations' => $violations,
            'filters' => $filters,
        ]);
    }

    /**
     * Export data.
     */
    public function export(Request $request): JsonResponse
    {
        $type = $request->get('type', 'occupancy');

        // TODO: Implement CSV/Excel export
        return response()->json(['message' => 'Export feature not yet implemented']);
    }
}
