<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PhaseMilestone extends Model
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
        'phase_id',
        'milestone_name',
        'description',
        'target_date',
        'actual_date',
        'status',
        'remarks',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_date' => 'date',
            'actual_date' => 'date',
        ];
    }

    /**
     * Get the phase that owns this milestone.
     */
    public function phase(): BelongsTo
    {
        return $this->belongsTo(ProjectPhase::class);
    }

    /**
     * Get the photos for this milestone.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ProjectPhoto::class);
    }
}
