<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectPhase extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'ipc_db';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'phase_name',
        'phase_type',
        'sequence_order',
        'start_date',
        'end_date',
        'actual_start_date',
        'actual_end_date',
        'budget',
        'actual_cost',
        'progress_percentage',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'actual_start_date' => 'date',
            'actual_end_date' => 'date',
            'budget' => 'decimal:2',
            'actual_cost' => 'decimal:2',
            'progress_percentage' => 'decimal:2',
        ];
    }

    /**
     * Get the project that owns this phase.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(InfrastructureProject::class);
    }

    /**
     * Get the milestones for this phase.
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(PhaseMilestone::class);
    }

    /**
     * Get the photos for this phase.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ProjectPhoto::class);
    }

    /**
     * Get the inspections for this phase.
     */
    public function inspections(): HasMany
    {
        return $this->hasMany(ProjectInspection::class);
    }

    /**
     * Get the budget tracking records for this phase.
     */
    public function budgetTracking(): HasMany
    {
        return $this->hasMany(BudgetTracking::class);
    }
}
