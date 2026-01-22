<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectInspection extends Model
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
        'inspection_type',
        'inspector_id',
        'scheduled_date',
        'inspection_date',
        'findings',
        'deficiencies',
        'result',
        'recommendations',
        'next_inspection_date',
        'inspected_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'inspection_date' => 'date',
            'next_inspection_date' => 'date',
            'inspected_at' => 'datetime',
        ];
    }

    /**
     * Get the project for this inspection.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(InfrastructureProject::class);
    }

    /**
     * Get the phase for this inspection.
     */
    public function phase(): BelongsTo
    {
        return $this->belongsTo(ProjectPhase::class);
    }

    /**
     * Get the inspector for this inspection.
     */
    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    /**
     * Get the photos for this inspection.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ProjectPhoto::class);
    }
}
