<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InfrastructureProject extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'ipc_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_code',
        'sbr_reference_no',
        'project_name',
        'project_description',
        'project_type',
        'location',
        'pin_lat',
        'pin_lng',
        'barangay',
        'budget',
        'actual_cost',
        'start_date',
        'target_completion',
        'actual_completion',
        'status',
        'project_manager_id',
        'scope_of_work',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pin_lat' => 'decimal:8',
            'pin_lng' => 'decimal:8',
            'budget' => 'decimal:2',
            'actual_cost' => 'decimal:2',
            'start_date' => 'date',
            'target_completion' => 'date',
            'actual_completion' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the project manager for this project.
     */
    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    /**
     * Get the phases for this project.
     */
    public function phases(): HasMany
    {
        return $this->hasMany(ProjectPhase::class);
    }

    /**
     * Get the documents for this project.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(InfrastructureProjectDocument::class);
    }

    /**
     * Get the updates for this project.
     */
    public function updates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class);
    }

    /**
     * Get the photos for this project.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ProjectPhoto::class);
    }

    /**
     * Get the contractors for this project.
     */
    public function contractors(): HasMany
    {
        return $this->hasMany(ProjectContractor::class);
    }

    /**
     * Get the budget tracking records for this project.
     */
    public function budgetTracking(): HasMany
    {
        return $this->hasMany(BudgetTracking::class);
    }

    /**
     * Get the inspections for this project.
     */
    public function inspections(): HasMany
    {
        return $this->hasMany(ProjectInspection::class);
    }
}
