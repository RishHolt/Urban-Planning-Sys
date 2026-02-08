<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectContractorRequest;
use App\Models\InfrastructureProject;
use App\Models\ProjectContractor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectContractorController extends Controller
{
    /**
     * Display a listing of contractors for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $contractors = $project->contractors()
            ->with(['contractor'])
            ->get()
            ->map(function ($projectContractor) {
                return [
                    'id' => (string) $projectContractor->id,
                    'contractor' => [
                        'id' => (string) $projectContractor->contractor->id,
                        'contractor_code' => $projectContractor->contractor->contractor_code,
                        'company_name' => $projectContractor->contractor->company_name,
                        'contact_person' => $projectContractor->contractor->contact_person,
                    ],
                    'role' => $projectContractor->role,
                    'contract_amount' => $projectContractor->contract_amount,
                    'contract_start_date' => $projectContractor->contract_start_date?->format('Y-m-d'),
                    'contract_end_date' => $projectContractor->contract_end_date?->format('Y-m-d'),
                    'status' => $projectContractor->status,
                    'remarks' => $projectContractor->remarks,
                ];
            });

        $availableContractors = \App\Models\Contractor::where('is_active', true)
            ->whereDoesntHave('projects', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->get()
            ->map(function ($contractor) {
                return [
                    'id' => (string) $contractor->id,
                    'contractor_code' => $contractor->contractor_code,
                    'company_name' => $contractor->company_name,
                ];
            });

        return Inertia::render('Admin/Infrastructure/ProjectContractors', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'contractors' => $contractors,
            'availableContractors' => $availableContractors,
        ]);
    }

    /**
     * Store a newly created project-contractor assignment.
     */
    public function store(StoreProjectContractorRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            ProjectContractor::create(array_merge(
                $request->validated(),
                [
                    'project_id' => $project->id,
                    'status' => 'active',
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Contractor assigned to project successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to assign contractor: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Update the specified project-contractor assignment.
     */
    public function update(Request $request, string $projectId, string $id): RedirectResponse
    {
        $projectContractor = ProjectContractor::where('project_id', $projectId)->findOrFail($id);

        $request->validate([
            'role' => ['sometimes', 'required', 'in:prime_contractor,subcontractor,supplier,consultant'],
            'contract_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'contract_start_date' => ['sometimes', 'required', 'date'],
            'contract_end_date' => ['sometimes', 'required', 'date', 'after_or_equal:contract_start_date'],
            'status' => ['sometimes', 'required', 'in:active,completed,terminated'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $projectContractor->update($request->only([
            'role',
            'contract_amount',
            'contract_start_date',
            'contract_end_date',
            'status',
            'remarks',
        ]));

        return redirect()->back()
            ->with('success', 'Contractor assignment updated successfully.');
    }

    /**
     * Remove the specified project-contractor assignment.
     */
    public function destroy(string $projectId, string $id): RedirectResponse
    {
        $projectContractor = ProjectContractor::where('project_id', $projectId)->findOrFail($id);

        $projectContractor->delete();

        return redirect()->back()
            ->with('success', 'Contractor removed from project successfully.');
    }
}
