<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoningClassificationRequest;
use App\Http\Requests\UpdateZoningClassificationRequest;
use App\Models\ZoningClassification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoningClassificationController extends Controller
{
    /**
     * Display a listing of classifications (Inertia page).
     */
    public function indexPage(Request $request): Response
    {
        $query = ZoningClassification::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $classifications = $query->orderBy('code', 'asc')
            ->paginate(15)
            ->through(function ($classification) {
                return [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ];
            });

        return Inertia::render('Admin/Zoning/ClassificationsIndex', [
            'classifications' => $classifications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Get all classifications (for dropdowns, etc.)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ZoningClassification::query();

        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $classifications = $query->orderBy('code', 'asc')
            ->get()
            ->map(function ($classification) {
                return [
                    'id' => (string) $classification->id,
                    'code' => $classification->code,
                    'name' => $classification->name,
                    'description' => $classification->description,
                    'allowed_uses' => $classification->allowed_uses,
                    'color' => $classification->color,
                    'is_active' => $classification->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $classifications,
        ]);
    }

    /**
     * Store a newly created classification.
     */
    public function store(StoreZoningClassificationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $classification = ZoningClassification::create($validated);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ],
        ], 201);
    }

    /**
     * Display the specified classification.
     */
    public function show(string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ],
        ]);
    }

    /**
     * Update the specified classification.
     */
    public function update(UpdateZoningClassificationRequest $request, string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);

        $validated = $request->validated();

        $classification->update($validated);

        return response()->json([
            'success' => true,
            'classification' => [
                'id' => (string) $classification->id,
                'code' => $classification->code,
                'name' => $classification->name,
                'description' => $classification->description,
                'allowed_uses' => $classification->allowed_uses,
                'color' => $classification->color,
                'is_active' => $classification->is_active,
            ],
        ]);
    }

    /**
     * Remove the specified classification.
     */
    public function destroy(string $id): JsonResponse
    {
        $classification = ZoningClassification::findOrFail($id);

        // Check if any zones use this classification
        if ($classification->zones()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete classification that has zones assigned to it.',
            ], 422);
        }

        $classification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Classification deleted successfully',
        ]);
    }
}
