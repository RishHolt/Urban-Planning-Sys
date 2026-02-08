<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectPhotoRequest;
use App\Http\Requests\UpdateProjectPhotoRequest;
use App\Models\InfrastructureProject;
use App\Models\ProjectPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectPhotoController extends Controller
{
    /**
     * Display a listing of photos for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $query = ProjectPhoto::where('project_id', $projectId)
            ->with(['phase', 'milestone', 'inspection', 'takenBy.profile']);

        if ($request->has('photo_category') && $request->photo_category) {
            $query->where('photo_category', $request->photo_category);
        }

        if ($request->has('phase_id') && $request->phase_id) {
            $query->where('phase_id', $request->phase_id);
        }

        if ($request->has('milestone_id') && $request->milestone_id) {
            $query->where('milestone_id', $request->milestone_id);
        }

        if ($request->has('inspection_id') && $request->inspection_id) {
            $query->where('inspection_id', $request->inspection_id);
        }

        $photos = $query->orderBy('taken_at', 'desc')
            ->get()
            ->map(function ($photo) {
                return [
                    'id' => (string) $photo->id,
                    'photo_path' => $photo->photo_path,
                    'photo_url' => Storage::url($photo->photo_path),
                    'photo_description' => $photo->photo_description,
                    'photo_category' => $photo->photo_category,
                    'taken_at' => $photo->taken_at?->format('Y-m-d H:i:s'),
                    'phase' => $photo->phase ? [
                        'id' => (string) $photo->phase->id,
                        'phase_name' => $photo->phase->phase_name,
                    ] : null,
                    'milestone' => $photo->milestone ? [
                        'id' => (string) $photo->milestone->id,
                        'milestone_name' => $photo->milestone->milestone_name,
                    ] : null,
                    'inspection' => $photo->inspection ? [
                        'id' => (string) $photo->inspection->id,
                        'inspection_type' => $photo->inspection->inspection_type,
                    ] : null,
                    'taken_by' => $photo->takenBy ? [
                        'id' => (string) $photo->takenBy->id,
                        'name' => $photo->takenBy->profile?->full_name ?? $photo->takenBy->email,
                    ] : null,
                ];
            });

        $phases = $project->phases()->get()->map(function ($phase) {
            return [
                'id' => (string) $phase->id,
                'phase_name' => $phase->phase_name,
            ];
        });

        $milestones = $project->phases()->with('milestones')->get()
            ->flatMap(function ($phase) {
                return $phase->milestones->map(function ($milestone) use ($phase) {
                    return [
                        'id' => (string) $milestone->id,
                        'milestone_name' => $milestone->milestone_name,
                        'phase_name' => $phase->phase_name,
                    ];
                });
            });

        $inspections = $project->inspections()->get()->map(function ($inspection) {
            return [
                'id' => (string) $inspection->id,
                'inspection_type' => $inspection->inspection_type,
                'scheduled_date' => $inspection->scheduled_date?->format('Y-m-d'),
            ];
        });

        return Inertia::render('Admin/Infrastructure/PhotoGallery', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'photos' => $photos,
            'phases' => $phases,
            'milestones' => $milestones,
            'inspections' => $inspections,
            'filters' => $request->only(['photo_category', 'phase_id', 'milestone_id', 'inspection_id']),
        ]);
    }

    /**
     * Store a newly uploaded photo.
     */
    public function store(StoreProjectPhotoRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            $file = $request->file('photo');
            $path = $file->store('infrastructure/photos', 'public');

            ProjectPhoto::create([
                'project_id' => $project->id,
                'phase_id' => $request->phase_id,
                'milestone_id' => $request->milestone_id,
                'inspection_id' => $request->inspection_id,
                'photo_path' => $path,
                'photo_description' => $request->photo_description,
                'photo_category' => $request->photo_category,
                'taken_at' => $request->taken_at ?? now(),
                'taken_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Photo uploaded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to upload photo: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified photo.
     */
    public function show(string $projectId, string $id): Response
    {
        $photo = ProjectPhoto::where('project_id', $projectId)
            ->with(['project', 'phase', 'milestone', 'inspection', 'takenBy.profile'])
            ->findOrFail($id);

        return Inertia::render('Admin/Infrastructure/PhotoShow', [
            'photo' => [
                'id' => (string) $photo->id,
                'photo_path' => $photo->photo_path,
                'photo_url' => Storage::url($photo->photo_path),
                'photo_description' => $photo->photo_description,
                'photo_category' => $photo->photo_category,
                'taken_at' => $photo->taken_at?->format('Y-m-d H:i:s'),
                'taken_by' => $photo->takenBy ? [
                    'id' => (string) $photo->takenBy->id,
                    'name' => $photo->takenBy->profile?->full_name ?? $photo->takenBy->email,
                ] : null,
            ],
        ]);
    }

    /**
     * Update the specified photo metadata.
     */
    public function update(UpdateProjectPhotoRequest $request, string $projectId, string $id): RedirectResponse
    {
        $photo = ProjectPhoto::where('project_id', $projectId)->findOrFail($id);

        $photo->update($request->validated());

        return redirect()->back()
            ->with('success', 'Photo metadata updated successfully.');
    }

    /**
     * Remove the specified photo.
     */
    public function destroy(string $projectId, string $id): RedirectResponse
    {
        $photo = ProjectPhoto::where('project_id', $projectId)->findOrFail($id);

        DB::beginTransaction();

        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($photo->photo_path)) {
                Storage::disk('public')->delete($photo->photo_path);
            }

            $photo->delete();

            DB::commit();

            return redirect()->back()
                ->with('success', 'Photo deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to delete photo: '.$e->getMessage());
        }
    }
}
