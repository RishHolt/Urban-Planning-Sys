<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRule;
use App\Models\ZoningClassification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceRuleController extends Controller
{
    /**
     * Display the compliance rules management page.
     */
    public function indexPage(Request $request): Response
    {
        $query = ComplianceRule::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('classification_code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $rules = $query->orderBy('classification_code', 'asc')
            ->paginate(15)
            ->through(function ($rule) {
                return [
                    'id' => (string) $rule->id,
                    'classification_code' => $rule->classification_code,
                    'name' => $rule->name,
                    'allowed_uses' => $rule->allowed_uses,
                    'front_setback' => (float) $rule->front_setback,
                    'rear_setback' => (float) $rule->rear_setback,
                    'side_setback' => (float) $rule->side_setback,
                    'floor_area_ratio' => (float) $rule->floor_area_ratio,
                    'max_height' => (float) $rule->max_height,
                    'max_storeys' => (int) $rule->max_storeys,
                    'open_space_requirement' => (float) $rule->open_space_requirement,
                    'min_lot_area' => (float) $rule->min_lot_area,
                    'is_active' => $rule->is_active,
                ];
            });

        $classifications = ZoningClassification::active()
            ->whereNotIn('code', ['BOUNDARY', 'BARANGAY'])
            ->orderBy('code', 'asc')
            ->get()
            ->map(fn ($c) => [
                'id' => (string) $c->id,
                'code' => $c->code,
                'name' => $c->name,
            ]);

        return Inertia::render('Admin/Zoning/ComplianceRulesIndex', [
            'rules' => $rules,
            'classifications' => $classifications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Store a new compliance rule.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'classification_code' => ['required', 'string', 'max:20', 'unique:zcs_db.compliance_rules,classification_code'],
            'name' => ['required', 'string', 'max:255'],
            'allowed_uses' => ['required', 'array', 'min:1'],
            'allowed_uses.*' => ['string'],
            'front_setback' => ['required', 'numeric', 'min:0'],
            'rear_setback' => ['required', 'numeric', 'min:0'],
            'side_setback' => ['required', 'numeric', 'min:0'],
            'floor_area_ratio' => ['required', 'numeric', 'min:0'],
            'max_height' => ['required', 'numeric', 'min:0'],
            'max_storeys' => ['required', 'integer', 'min:1'],
            'open_space_requirement' => ['required', 'numeric', 'min:0', 'max:1'],
            'min_lot_area' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $rule = ComplianceRule::create($validated);

        return response()->json([
            'success' => true,
            'rule' => $this->formatRule($rule),
        ], 201);
    }

    /**
     * Display a single compliance rule.
     */
    public function show(string $id): JsonResponse
    {
        $rule = ComplianceRule::findOrFail($id);

        return response()->json([
            'success' => true,
            'rule' => $this->formatRule($rule),
        ]);
    }

    /**
     * Update a compliance rule.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $rule = ComplianceRule::findOrFail($id);

        $validated = $request->validate([
            'classification_code' => ['sometimes', 'string', 'max:20', 'unique:zcs_db.compliance_rules,classification_code,'.$id],
            'name' => ['sometimes', 'string', 'max:255'],
            'allowed_uses' => ['sometimes', 'array', 'min:1'],
            'allowed_uses.*' => ['string'],
            'front_setback' => ['sometimes', 'numeric', 'min:0'],
            'rear_setback' => ['sometimes', 'numeric', 'min:0'],
            'side_setback' => ['sometimes', 'numeric', 'min:0'],
            'floor_area_ratio' => ['sometimes', 'numeric', 'min:0'],
            'max_height' => ['sometimes', 'numeric', 'min:0'],
            'max_storeys' => ['sometimes', 'integer', 'min:1'],
            'open_space_requirement' => ['sometimes', 'numeric', 'min:0', 'max:1'],
            'min_lot_area' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $rule->update($validated);

        return response()->json([
            'success' => true,
            'rule' => $this->formatRule($rule),
        ]);
    }

    /**
     * Delete a compliance rule.
     */
    public function destroy(string $id): JsonResponse
    {
        $rule = ComplianceRule::findOrFail($id);
        $rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Compliance rule deleted successfully.',
        ]);
    }

    /**
     * Seed rules from config file into the database.
     */
    public function seedFromConfig(): JsonResponse
    {
        $configRules = config('zoning-compliance.rules', []);
        $created = 0;
        $skipped = 0;

        foreach ($configRules as $code => $rule) {
            $exists = ComplianceRule::where('classification_code', $code)->exists();

            if ($exists) {
                $skipped++;

                continue;
            }

            ComplianceRule::create([
                'classification_code' => $code,
                'name' => $rule['name'],
                'allowed_uses' => $rule['allowed_uses'],
                'front_setback' => $rule['setbacks']['front'],
                'rear_setback' => $rule['setbacks']['rear'],
                'side_setback' => $rule['setbacks']['side'],
                'floor_area_ratio' => $rule['floor_area_ratio'],
                'max_height' => $rule['max_height'],
                'max_storeys' => $rule['max_storeys'],
                'open_space_requirement' => $rule['open_space_requirement'],
                'min_lot_area' => $rule['min_lot_area'],
                'is_active' => true,
            ]);

            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "Seeded {$created} rules from config ({$skipped} already existed).",
        ]);
    }

    private function formatRule(ComplianceRule $rule): array
    {
        return [
            'id' => (string) $rule->id,
            'classification_code' => $rule->classification_code,
            'name' => $rule->name,
            'allowed_uses' => $rule->allowed_uses,
            'front_setback' => (float) $rule->front_setback,
            'rear_setback' => (float) $rule->rear_setback,
            'side_setback' => (float) $rule->side_setback,
            'floor_area_ratio' => (float) $rule->floor_area_ratio,
            'max_height' => (float) $rule->max_height,
            'max_storeys' => (int) $rule->max_storeys,
            'open_space_requirement' => (float) $rule->open_space_requirement,
            'min_lot_area' => (float) $rule->min_lot_area,
            'is_active' => $rule->is_active,
        ];
    }
}
