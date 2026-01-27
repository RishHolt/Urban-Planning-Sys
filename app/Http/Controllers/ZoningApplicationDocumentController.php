<?php

namespace App\Http\Controllers;

use App\Models\ZoningApplication;
use App\Models\ZoningApplicationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\ApplicationHistory;

class ZoningApplicationDocumentController extends Controller
{
    /**
     * Upload a document for a zoning application.
     */
    public function store(Request $request, string $id)
    {
        $application = ZoningApplication::findOrFail($id);
        
        // Authorization check - only applicant or admin
        if (strval($application->user_id) !== strval(Auth::id()) && !in_array(Auth::user()->role, ['admin', 'staff'])) {
            abort(403);
        }

        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png',
            'document_type' => 'required|string',
        ]);

        $file = $request->file('file');
        $documentType = $request->input('document_type');

        // Check if there is an existing current document of this type
        $existingDoc = $application->documents()
            ->where('document_type', $documentType)
            ->where('is_current', true)
            ->first();

        $version = 1;
        $parentId = null;

        if ($existingDoc) {
            $version = $existingDoc->version + 1;
            $parentId = $existingDoc->parent_document_id ?? $existingDoc->id;
            
            // Mark existing as not current
            $existingDoc->update(['is_current' => false]);
        }

        // Store file
        $path = $file->store("applications/{$application->reference_no}/documents", 'public');

        $document = ZoningApplicationDocument::create([
            'zoning_application_id' => $application->id,
            'document_type' => $documentType,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => 'pending',
            'version' => $version,
            'parent_document_id' => $parentId,
            'is_current' => true,
        ]);

        if ($existingDoc) {
            $existingDoc->update(['replaced_by' => $document->id, 'replaced_at' => now()]);
        }

        // Log to history
        ApplicationHistory::create([
            'application_id' => $application->id,
            'status' => $application->status,
            'remarks' => "Document '{$documentType}' uploaded (Version {$version})",
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Document uploaded successfully as Version {$version}.");
    }

    /**
     * Update document status (Admin only).
     */
    public function updateStatus(Request $request, string $applicationId, string $documentId)
    {
        if (!in_array(Auth::user()->role, ['admin', 'staff'])) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $document = ZoningApplicationDocument::findOrFail($documentId);
        
        $document->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'reviewed_by' => Auth::user()->id,
            'reviewed_at' => now(),
        ]);

        // Log to history
        ApplicationHistory::create([
            'application_id' => $document->zoning_application_id,
            'status' => $document->zoningApplication->status,
            'remarks' => "Document '{$document->document_type}' {$request->status}" . ($request->notes ? ": {$request->notes}" : ""),
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Document status updated to {$request->status}.");
    }

    /**
     * Download a document.
     */
    public function download(string $applicationId, string $documentId)
    {
        $document = ZoningApplicationDocument::findOrFail($documentId);
        
        // Authorization check
        if (strval($document->zoningApplication->user_id) !== strval(Auth::id()) && !in_array(Auth::user()->role, ['admin', 'staff'])) {
            abort(403);
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}
