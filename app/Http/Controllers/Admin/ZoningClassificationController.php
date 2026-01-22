<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoningClassificationRequest;
use App\Http\Requests\UpdateZoningClassificationRequest;
use App\Models\ZoningClassification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoningClassificationController extends Controller
{
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
