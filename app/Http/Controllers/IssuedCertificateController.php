<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIssuedCertificateRequest;
use App\Models\IssuedCertificate;
use App\Models\SbrApplicationHistory;
use App\Models\SubdivisionApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class IssuedCertificateController extends Controller
{
    /**
     * Display a listing of issued certificates.
     */
    public function index(Request $request): Response
    {
        $query = IssuedCertificate::with('application');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('certificate_no', 'like', "%{$search}%")
                    ->orWhereHas('application', function ($q) use ($search) {
                        $q->where('reference_no', 'like', "%{$search}%")
                            ->orWhere('subdivision_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $certificates = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($certificate) {
                return [
                    'id' => (string) $certificate->id,
                    'certificateNo' => $certificate->certificate_no,
                    'subdivisionName' => $certificate->application->subdivision_name,
                    'issueDate' => $certificate->issue_date->format('Y-m-d'),
                    'validUntil' => $certificate->valid_until?->format('Y-m-d'),
                    'status' => $certificate->status,
                ];
            });

        return Inertia::render('Admin/Subdivision/CertificatesIndex', [
            'certificates' => $certificates,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new certificate.
     */
    public function create(Request $request): Response
    {
        $applicationId = $request->query('application_id');
        $application = $applicationId ? SubdivisionApplication::findOrFail($applicationId) : null;

        return Inertia::render('Admin/Subdivision/CertificateForm', [
            'application' => $application ? [
                'id' => $application->id,
                'referenceNo' => $application->reference_no,
                'subdivisionName' => $application->subdivision_name,
            ] : null,
        ]);
    }

    /**
     * Store a newly issued certificate.
     */
    public function store(StoreIssuedCertificateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $application = SubdivisionApplication::findOrFail($validated['application_id']);

        if ($application->status !== 'approved') {
            return back()->withErrors(['application' => 'Application must be approved before issuing certificate.'])->withInput();
        }

        $certificate = IssuedCertificate::create([
            'certificate_no' => IssuedCertificate::generateCertificateNo(),
            'application_id' => $validated['application_id'],
            'issued_by' => Auth::id(),
            'issue_date' => $validated['issue_date'],
            'valid_until' => $validated['valid_until'] ?? null,
            'conditions' => $validated['conditions'] ?? null,
            'final_plat_reference' => $validated['final_plat_reference'] ?? null,
            'status' => 'active',
        ]);

        // Update application
        $application->update([
            'approved_at' => now(),
        ]);

        // Create history record
        SbrApplicationHistory::create([
            'application_type' => 'subdivision',
            'application_id' => $application->id,
            'status' => 'approved',
            'remarks' => "Certificate {$certificate->certificate_no} issued",
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.subdivision.certificates.show', $certificate->id)
            ->with('success', 'Certificate issued successfully. Certificate No: '.$certificate->certificate_no);
    }

    /**
     * Display the specified certificate.
     */
    public function show(string $id): Response
    {
        $certificate = IssuedCertificate::with('application')->findOrFail($id);

        return Inertia::render('Admin/Subdivision/CertificateDetails', [
            'certificate' => [
                'id' => $certificate->id,
                'certificateNo' => $certificate->certificate_no,
                'application' => [
                    'id' => $certificate->application->id,
                    'referenceNo' => $certificate->application->reference_no,
                    'subdivisionName' => $certificate->application->subdivision_name,
                ],
                'issueDate' => $certificate->issue_date->format('Y-m-d'),
                'validUntil' => $certificate->valid_until?->format('Y-m-d'),
                'conditions' => $certificate->conditions,
                'finalPlatReference' => $certificate->final_plat_reference,
                'status' => $certificate->status,
            ],
        ]);
    }
}
