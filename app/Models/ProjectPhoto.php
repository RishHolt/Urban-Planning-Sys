<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectPhoto extends IpcModel
{
    use HasFactory;

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
        'milestone_id',
        'inspection_id',
        'photo_path',
        'photo_description',
        'photo_category',
        'taken_at',
        'taken_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'taken_at' => 'datetime',
        ];
    }

    /**
     * Get the project that owns this photo.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(InfrastructureProject::class);
    }

    /**
     * Get the phase for this photo.
     */
    public function phase(): BelongsTo
    {
        return $this->belongsTo(ProjectPhase::class);
    }

    /**
     * Get the milestone for this photo.
     */
    public function milestone(): BelongsTo
    {
        return $this->belongsTo(PhaseMilestone::class);
    }

    /**
     * Get the inspection for this photo.
     */
    public function inspection(): BelongsTo
    {
        return $this->belongsTo(ProjectInspection::class);
    }

    /**
     * Get the user who took this photo.
     */
    public function takenBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'taken_by');
    }
}
