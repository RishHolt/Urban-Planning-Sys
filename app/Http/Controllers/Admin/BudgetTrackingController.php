<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordExpenseRequest;
use App\Http\Requests\StoreBudgetTrackingRequest;
use App\Http\Requests\UpdateBudgetTrackingRequest;
use App\Models\BudgetTracking;
use App\Models\InfrastructureProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BudgetTrackingController extends Controller
{
    /**
     * Display a listing of budget records for a project.
     */
    public function index(Request $request, string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $query = BudgetTracking::where('project_id', $projectId)
            ->with(['phase']);

        if ($request->has('budget_category') && $request->budget_category) {
            $query->where('budget_category', $request->budget_category);
        }

        if ($request->has('year') && $request->year) {
            $query->where('year', $request->year);
        }

        if ($request->has('quarter') && $request->quarter) {
            $query->where('quarter', $request->quarter);
        }

        $budgetRecords = $query->orderBy('year', 'desc')
            ->orderBy('quarter', 'desc')
            ->orderBy('budget_category', 'asc')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => (string) $record->id,
                    'phase' => $record->phase ? [
                        'id' => (string) $record->phase->id,
                        'phase_name' => $record->phase->phase_name,
                    ] : null,
                    'budget_category' => $record->budget_category,
                    'allocated_amount' => $record->allocated_amount,
                    'spent_amount' => $record->spent_amount,
                    'remaining_amount' => $record->remaining_amount,
                    'description' => $record->description,
                    'year' => $record->year,
                    'quarter' => $record->quarter,
                ];
            });

        // Calculate summary
        $summary = [
            'total_allocated' => $budgetRecords->sum('allocated_amount'),
            'total_spent' => $budgetRecords->sum('spent_amount'),
            'total_remaining' => $budgetRecords->sum('remaining_amount'),
        ];

        $phases = $project->phases()->get()->map(function ($phase) {
            return [
                'id' => (string) $phase->id,
                'phase_name' => $phase->phase_name,
            ];
        });

        return Inertia::render('Admin/Infrastructure/BudgetTracking', [
            'project' => [
                'id' => (string) $project->id,
                'project_code' => $project->project_code,
                'project_name' => $project->project_name,
                'budget' => $project->budget,
                'actual_cost' => $project->actual_cost,
            ],
            'budgetRecords' => $budgetRecords,
            'summary' => $summary,
            'phases' => $phases,
            'filters' => $request->only(['budget_category', 'year', 'quarter']),
        ]);
    }

    /**
     * Store a newly created budget allocation.
     */
    public function store(StoreBudgetTrackingRequest $request, string $projectId): RedirectResponse
    {
        $project = InfrastructureProject::findOrFail($projectId);

        DB::beginTransaction();

        try {
            $allocatedAmount = $request->allocated_amount;
            $remainingAmount = $allocatedAmount;

            BudgetTracking::create(array_merge(
                $request->validated(),
                [
                    'project_id' => $project->id,
                    'remaining_amount' => $remainingAmount,
                ]
            ));

            DB::commit();

            return redirect()->back()
                ->with('success', 'Budget allocation created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to create budget allocation: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Update the specified budget record.
     */
    public function update(UpdateBudgetTrackingRequest $request, string $projectId, string $id): RedirectResponse
    {
        $budgetRecord = BudgetTracking::where('project_id', $projectId)->findOrFail($id);

        $data = $request->validated();

        // Recalculate remaining amount if allocated_amount changed
        if (isset($data['allocated_amount'])) {
            $data['remaining_amount'] = $data['allocated_amount'] - $budgetRecord->spent_amount;
        }

        $budgetRecord->update($data);

        return redirect()->back()
            ->with('success', 'Budget record updated successfully.');
    }

    /**
     * Record an expense.
     */
    public function recordExpense(RecordExpenseRequest $request, string $projectId, string $id): RedirectResponse
    {
        $budgetRecord = BudgetTracking::where('project_id', $projectId)->findOrFail($id);

        DB::beginTransaction();

        try {
            $expenseAmount = $request->expense_amount;
            $newSpentAmount = $budgetRecord->spent_amount + $expenseAmount;
            $newRemainingAmount = $budgetRecord->allocated_amount - $newSpentAmount;

            if ($newRemainingAmount < 0) {
                return redirect()->back()
                    ->with('error', 'Expense amount exceeds remaining budget.')
                    ->withInput();
            }

            $budgetRecord->update([
                'spent_amount' => $newSpentAmount,
                'remaining_amount' => $newRemainingAmount,
            ]);

            // Update project actual_cost
            $project = InfrastructureProject::findOrFail($projectId);
            $project->increment('actual_cost', $expenseAmount);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Expense recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Failed to record expense: '.$e->getMessage())
                ->withInput();
        }
    }

    /**
     * Get budget summary.
     */
    public function getSummary(string $projectId): Response
    {
        $project = InfrastructureProject::findOrFail($projectId);

        $budgetRecords = BudgetTracking::where('project_id', $projectId)->get();

        $summary = [
            'total_allocated' => $budgetRecords->sum('allocated_amount'),
            'total_spent' => $budgetRecords->sum('spent_amount'),
            'total_remaining' => $budgetRecords->sum('remaining_amount'),
            'by_category' => $budgetRecords->groupBy('budget_category')->map(function ($records) {
                return [
                    'allocated' => $records->sum('allocated_amount'),
                    'spent' => $records->sum('spent_amount'),
                    'remaining' => $records->sum('remaining_amount'),
                ];
            }),
        ];

        return response()->json($summary);
    }
}
