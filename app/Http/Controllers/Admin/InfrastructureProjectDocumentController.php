<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInfrastructureProjectDocumentRequest;
use App\Models\InfrastructureProject;
use App\Models\InfrastructureProjectDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InfrastructureProjectDocumentController extends Controller
{
    /**
     * Display a listing of documents for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $query = InfrastructureProjectDocument::where('project_id', $projectId);

        if ($request->has('document_type') && $request->document_type) {
            $query->where('document_type', $request->document_type);
        }

        $documents = $query->orderBy('uploaded_at', 'desc')
            ->get()
            ->map(function ($document) {
                return [
                    'id' => (string) $document->id,
                    'document_type' => $document->document_type,
                    'file_name' => $document->file_name,
                    'file_path' => $document->file_path,
                    'file_url' => Storage::url($document->file_path),
                    'file_type' => $document->file_type,
                    'file_size' => $document->file_size,
                    'uploaded_at' => $document->uploaded_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Infrastructure/DocumentsIndex', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
            ],
            'documents' => $documents,
            'filters' => $request->only(['document_type']),
        ]);
    }

    /**
     * Store a newly uploaded document.
     */
    public function store(StoreInfrastructureProjectDocumentRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            $file = $request->file('document');
            $path = $file->store('infrastructure/documents', 'public');

            InfrastructureProjectDocument::create([
                'project_id' => $project->id,
                'document_type' => $request->document_type,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Document uploaded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to upload document: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified document (download).
     */
    public function show(string $projectId, string $id): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $document = InfrastructureProjectDocument::where('project_id', $projectId)->findOrFail($id);

        if (! Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Document not found');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Remove the specified document.
     */
    public function destroy(string $projectId, string $id): RedirectResponse
    {
        $document = InfrastructureProjectDocument::where('project_id', $projectId)->findOrFail($id);

        DB::beginTransaction();

        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            DB::commit();

            return redirect()->back()
                ->with('success', 'Document deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to delete document: '.$e->getMessage());
        }
    }
}
