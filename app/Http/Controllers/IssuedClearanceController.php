<?php

namespace App\Http\Controllers;

use App\Http\Requests\IssueClearanceRequest;
use App\Models\ApplicationHistory;
use App\Models\ZoningApplication;
use App\Models\IssuedClearance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class IssuedClearanceController extends Controller
{
    /**
     * Display a listing of all issued clearances.
     */
    public function index(Request $request): Response
    {
        $query = IssuedClearance::with(['clearanceApplication.zone']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('clearance_no', 'like', "%{$search}%")
                    ->orWhereHas('clearanceApplication', function ($q) use ($search) {
                        $q->where('reference_no', 'like', "%{$search}%")
                            ->orWhere('lot_owner', 'like', "%{$search}%")
                            ->orWhere('lot_address', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $clearances = $query->orderBy('issue_date', 'desc')
            ->paginate(15)
            ->through(function ($clearance) {
                return [
                    'id' => (string) $clearance->id,
                    'clearance_no' => $clearance->clearance_no,
                    'reference_no' => $clearance->clearanceApplication->reference_no,
                    'lot_owner' => $clearance->clearanceApplication->lot_owner,
                    'lot_address' => $clearance->clearanceApplication->lot_address,
                    'issue_date' => $clearance->issue_date->format('Y-m-d'),
                    'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                    'status' => $clearance->status,
                ];
            });

        return Inertia::render('Admin/Zoning/ClearancesIndex', [
            'clearances' => $clearances,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display the specified issued clearance.
     */
    public function show(string $id): Response
    {
        $clearance = IssuedClearance::with(['clearanceApplication.zone.classification'])
            ->findOrFail($id);

        return Inertia::render('Admin/Zoning/ClearanceDetails', [
            'clearance' => [
                'id' => $clearance->id,
                'clearance_no' => $clearance->clearance_no,
                'application_id' => $clearance->application_id,
                'issue_date' => $clearance->issue_date->format('Y-m-d'),
                'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                'conditions' => $clearance->conditions,
                'status' => $clearance->status,
                'created_at' => $clearance->created_at->format('Y-m-d H:i:s'),
                'clearanceApplication' => [
                    'id' => $clearance->clearanceApplication->id,
                    'reference_no' => $clearance->clearanceApplication->reference_no,
                    'applicant_type' => $clearance->clearanceApplication->applicant_type,
                    'lot_address' => $clearance->clearanceApplication->lot_address,
                    'lot_owner' => $clearance->clearanceApplication->lot_owner,
                    'zone' => $clearance->clearanceApplication->zone ? [
                        'name' => $clearance->clearanceApplication->zone->classification?->name ?? 'N/A',
                        'code' => $clearance->clearanceApplication->zone->classification?->code ?? 'N/A',
                    ] : null,
                ],
            ],
        ]);
    }

    /**
     * Show the issue clearance form.
     */
    public function create(Request $request): Response
    {
        $applicationId = $request->query('application_id');
        $application = ZoningApplication::findOrFail($applicationId);

        return Inertia::render('Admin/Zoning/IssueClearance', [
            'application' => [
                'id' => $application->id,
                'reference_no' => $application->reference_no,
                'lot_address' => $application->lot_address,
                'lot_owner' => $application->lot_owner,
                'status' => $application->status,
            ],
        ]);
    }

    /**
     * Issue a clearance for an approved application.
     */
    public function store(IssueClearanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $application = ZoningApplication::findOrFail($validated['application_id']);

        if ($application->status !== 'approved') {
            return back()->withErrors([
                'application_id' => 'Application must be approved before issuing clearance.',
            ]);
        }

        // Generate clearance number
        $clearanceNo = IssuedClearance::generateClearanceNo();

        // Create issued clearance
        $clearance = IssuedClearance::create([
            'clearance_no' => $clearanceNo,
            'application_id' => $application->id,
            'issued_by' => Auth::id(),
            'issue_date' => $validated['issue_date'],
            'valid_until' => $validated['valid_until'] ?? null,
            'conditions' => $validated['conditions'] ?? null,
            'status' => 'active',
        ]);

        // Update application
        $application->update([
            'processed_at' => now(),
        ]);

        // Create history record
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => 'approved',
            'remarks' => 'Clearance issued. Clearance Number: '.$clearanceNo,
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return redirect()->route('clearances.show', $clearance->id)
            ->with('success', 'Clearance issued successfully. Clearance Number: '.$clearanceNo);
    }

    /**
     * Download the clearance certificate as PDF.
     */
    public function download(string $id)
    {
        $clearance = IssuedClearance::with(['clearanceApplication.zone', 'approvedBy'])->findOrFail($id);
        $application = $clearance->clearanceApplication;

        // Generate QR code for verification
        $verificationUrl = url("/clearances/{$clearance->id}/verify");
        
        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(100),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        );
        $writer = new \BaconQrCode\Writer($renderer);
        $qrCode = base64_encode($writer->writeString($verificationUrl));

        // Load and encode logo
        $logoPath = public_path('logo.png');
        $logo = base64_encode(file_get_contents($logoPath));

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.clearance', [
            'clearance' => $clearance,
            'application' => $application,
            'qrCode' => $qrCode,
            'logo' => $logo,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = 'Zoning_Clearance_' . $clearance->clearance_no . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * View the clearance certificate as PDF in browser.
     */
    public function view(string $id)
    {
        $clearance = IssuedClearance::with(['clearanceApplication.zone', 'approvedBy'])->findOrFail($id);
        $application = $clearance->clearanceApplication;

        // Generate QR code for verification
        $verificationUrl = url("/clearances/{$clearance->id}/verify");
        
        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(100),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        );
        $writer = new \BaconQrCode\Writer($renderer);
        $qrCode = base64_encode($writer->writeString($verificationUrl));

        // Load and encode logo
        $logoPath = public_path('logo.png');
        $logo = base64_encode(file_get_contents($logoPath));

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.clearance', [
            'clearance' => $clearance,
            'application' => $application,
            'qrCode' => $qrCode,
            'logo' => $logo,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Zoning_Clearance_' . $clearance->clearance_no . '.pdf');
    }
}
