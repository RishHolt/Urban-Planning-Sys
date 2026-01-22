<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetTracking extends Model
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
        'phase_id',
        'budget_category',
        'allocated_amount',
        'spent_amount',
        'remaining_amount',
        'description',
        'year',
        'quarter',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'allocated_amount' => 'decimal:2',
            'spent_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'year' => 'integer',
            'quarter' => 'integer',
        ];
    }

    /**
     * Get the project for this budget tracking record.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(InfrastructureProject::class);
    }

    /**
     * Get the phase for this budget tracking record.
     */
    public function phase(): BelongsTo
    {
        return $this->belongsTo(ProjectPhase::class);
    }
}
