<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\ComplianceReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceReportController extends Controller
{
    /**
     * Display a listing of compliance reports.
     */
    public function index(Request $request): Response
    {
        $query = ComplianceReport::with(['building', 'unit', 'generatedBy']);

        // Filter by year
        if ($request->has('year') && $request->year) {
            $query->where('year', $request->year);
        }

        // Filter by quarter
        if ($request->has('quarter') && $request->quarter) {
            $query->where('quarter', $request->quarter);
        }

        // Filter by compliance status
        if ($request->has('compliance_status') && $request->compliance_status) {
            $query->where('compliance_status', $request->compliance_status);
        }

        $reports = $query->orderBy('generated_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($report) {
                return [
                    'id' => (string) $report->id,
                    'building' => $report->building ? [
                        'id' => (string) $report->building->id,
                        'building_code' => $report->building->building_code,
                        'building_name' => $report->building->building_name,
                    ] : null,
                    'unit' => $report->unit ? [
                        'id' => (string) $report->unit->id,
                        'unit_no' => $report->unit->unit_no,
                    ] : null,
                    'year' => $report->year,
                    'quarter' => $report->quarter,
                    'compliance_status' => $report->compliance_status,
                    'violations_count' => $report->violations_count,
                    'inspections_count' => $report->inspections_count,
                    'generated_at' => $report->generated_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Occupancy/ComplianceReportsIndex', [
            'reports' => $reports,
            'filters' => $request->only(['year', 'quarter', 'compliance_status']),
        ]);
    }

    /**
     * Display the specified compliance report.
     */
    public function show(string $id): Response
    {
        $report = ComplianceReport::with([
            'building',
            'unit',
            'generatedBy',
        ])->findOrFail($id);

        return Inertia::render('Admin/Occupancy/ComplianceReportShow', [
            'report' => $report,
        ]);
    }
}
