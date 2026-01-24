<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ZoningApplicationResource;
use App\Models\ZoningApplication;
use App\Models\ZoningApplicationStatusHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminZoningApplicationController extends Controller
{
    /**
     * Display a listing of all zoning applications.
     */
    public function index(Request $request): Response
    {
        $query = ZoningApplication::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('proposed_use', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by applicant type
        if ($request->has('applicantType') && $request->applicantType) {
            $query->where('applicant_type', $request->applicantType);
        }

        // Filter by municipality
        if ($request->has('municipality') && $request->municipality) {
            $query->where('municipality', 'like', "%{$request->municipality}%");
        }

        // Filter by barangay
        if ($request->has('barangay') && $request->barangay) {
            $query->where('barangay', 'like', "%{$request->barangay}%");
        }

        // Filter by date range
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->where('application_date', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->where('application_date', '<=', $request->dateTo);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        // Manually transform the collection to preserve pagination structure for frontend
        $applications->getCollection()->transform(function ($application) {
            return (new ZoningApplicationResource($application))->resolve();
        });

        return Inertia::render('Admin/Zoning/ApplicationsIndex', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'applicantType' => $request->applicantType,
                'municipality' => $request->municipality,
                'barangay' => $request->barangay,
                'dateFrom' => $request->dateFrom,
                'dateTo' => $request->dateTo,
            ],
        ]);
    }

    /**
     * Display the specified zoning application.
     */
    public function show(string $id): Response
    {
        $application = ZoningApplication::with([
            'documents',
            'statusHistory',
        ])->findOrFail($id);

        return Inertia::render('Admin/Zoning/ApplicationDetails', [
            'application' => (new ZoningApplicationResource($application))->resolve(),
        ]);
    }

    /**
     * Update application status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,under_review,approved,rejected'],
            'notes' => ['nullable', 'string'],
            'rejection_reason' => ['nullable', 'string', 'required_if:status,rejected'],
        ]);

        $application = ZoningApplication::findOrFail($id);
        $oldStatus = $application->status;
        
        // Update application
        $application->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $application->notes,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // If approved, set approval fields
        if ($validated['status'] === 'approved') {
            $application->update([
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        }

        // Create status history
        ZoningApplicationStatusHistory::create([
            'zoning_application_id' => $application->id,
            'status_from' => $oldStatus,
            'status_to' => $validated['status'],
            'changed_by' => auth()->id(),
            'notes' => $validated['notes'] ?? null,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Application status updated successfully.');
    }

    /**
     * Export applications to CSV.
     */
    public function export(Request $request)
    {
        $query = ZoningApplication::query();

        // Apply same filters as index
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                    ->orWhere('applicant_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('applicantType') && $request->applicantType) {
            $query->where('applicant_type', $request->applicantType);
        }

        if ($request->has('municipality') && $request->municipality) {
            $query->where('municipality', 'like', "%{$request->municipality}%");
        }

        if ($request->has('barangay') && $request->barangay) {
            $query->where('barangay', 'like', "%{$request->barangay}%");
        }

        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->where('application_date', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->where('application_date', '<=', $request->dateTo);
        }

        $applications = $query->orderBy('created_at', 'desc')->get();

        // Create CSV
        $filename = 'zoning_applications_'.date('Y-m-d_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($applications) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Application Number',
                'Applicant Type',
                'Applicant Name',
                'Company Name',
                'Email',
                'Contact',
                'Province',
                'Municipality',
                'Barangay',
                'Lot Area',
                'Application Type',
                'Proposed Use',
                'Status',
                'Application Date',
                'Submitted At',
            ]);

            // CSV Data
            foreach ($applications as $application) {
                fputcsv($file, [
                    $application->application_number,
                    $application->applicant_type,
                    $application->applicant_name,
                    $application->company_name,
                    $application->applicant_email,
                    $application->applicant_contact,
                    $application->province,
                    $application->municipality,
                    $application->barangay,
                    $application->lot_area,
                    $application->application_type,
                    $application->proposed_use,
                    $application->status,
                    $application->application_date?->format('Y-m-d'),
                    $application->submitted_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
