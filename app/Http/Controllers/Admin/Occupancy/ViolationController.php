<?php

namespace App\Http\Controllers\Admin\Occupancy;

use App\Http\Controllers\Controller;
use App\Models\Violation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViolationController extends Controller
{
    /**
     * Display a listing of violations.
     */
    public function index(Request $request): Response
    {
        $query = Violation::with(['building', 'unit', 'inspection', 'issuedBy']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('violation_no', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('building', function ($q) use ($search) {
                        $q->where('building_code', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity) {
            $query->where('severity', $request->severity);
        }

        // Filter by violation type
        if ($request->has('violation_type') && $request->violation_type) {
            $query->where('violation_type', $request->violation_type);
        }

        $violations = $query->orderBy('violation_date', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($violation) {
                return [
                    'id' => (string) $violation->id,
                    'violation_no' => $violation->violation_no,
                    'violation_type' => $violation->violation_type,
                    'severity' => $violation->severity,
                    'status' => $violation->status,
                    'building' => $violation->building ? [
                        'id' => (string) $violation->building->id,
                        'building_code' => $violation->building->building_code,
                    ] : null,
                    'unit' => $violation->unit ? [
                        'id' => (string) $violation->unit->id,
                        'unit_no' => $violation->unit->unit_no,
                    ] : null,
                    'violation_date' => $violation->violation_date?->format('Y-m-d'),
                    'compliance_deadline' => $violation->compliance_deadline?->format('Y-m-d'),
                    'fine_amount' => $violation->fine_amount,
                    'created_at' => $violation->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Occupancy/ViolationsIndex', [
            'violations' => $violations,
            'filters' => $request->only(['search', 'status', 'severity', 'violation_type']),
        ]);
    }

    /**
     * Display the specified violation.
     */
    public function show(string $id): Response
    {
        $violation = Violation::with([
            'building',
            'unit',
            'inspection',
            'issuedBy',
            'resolvedBy',
        ])->findOrFail($id);

        return Inertia::render('Admin/Occupancy/ViolationShow', [
            'violation' => $violation,
        ]);
    }
}
