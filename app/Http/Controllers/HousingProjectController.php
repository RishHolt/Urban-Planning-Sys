<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHousingProjectRequest;
use App\Models\HousingProject;
use App\Services\ZoningClearanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HousingProjectController extends Controller
{
    public function __construct(
        protected ZoningClearanceService $zoningClearanceService
    ) {}

    /**
     * Display a listing of housing projects.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', HousingProject::class);

        $query = HousingProject::query();

        if ($request->has('status')) {
            $query->where('project_status', $request->status);
        }

        if ($request->has('housing_program')) {
            $query->where('housing_program', $request->housing_program);
        }

        $projects = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($project) {
                return [
                    'id' => (string) $project->id,
                    'project_code' => $project->project_code,
                    'project_name' => $project->project_name,
                    'location' => $project->location,
                    'housing_program' => $project->housing_program,
                    'total_units' => $project->total_units,
                    'available_units' => $project->available_units,
                    'project_status' => $project->project_status,
                ];
            });

        return Inertia::render('Admin/Housing/ProjectsIndex', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created housing project.
     */
    public function store(StoreHousingProjectRequest $request): RedirectResponse
    {
        $this->authorize('create', HousingProject::class);

        // Verify zoning clearance if provided
        if ($request->zoning_clearance_no && ! $this->zoningClearanceService->verifyClearance($request->zoning_clearance_no)) {
            return back()->withErrors([
                'zoning_clearance_no' => 'Invalid zoning clearance number.',
            ])->withInput();
        }

        HousingProject::create($request->validated());

        return redirect()->back()->with('success', 'Housing project created successfully.');
    }

    /**
     * Display the specified housing project.
     */
    public function show(string $id): Response
    {
        $project = HousingProject::with(['units', 'documents'])->findOrFail($id);

        $this->authorize('view', $project);

        return Inertia::render('Admin/Housing/ProjectShow', [
            'project' => $project,
        ]);
    }

    /**
     * Update the specified housing project.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $project = HousingProject::findOrFail($id);

        $this->authorize('update', $project);

        $request->validate([
            'project_name' => ['sometimes', 'string', 'max:255'],
            'project_status' => ['sometimes', 'in:planning,under_construction,completed,fully_allocated'],
            'total_units' => ['sometimes', 'integer', 'min:0'],
        ]);

        $project->update($request->only(['project_name', 'project_status', 'total_units']));

        return redirect()->back()->with('success', 'Housing project updated successfully.');
    }
}
