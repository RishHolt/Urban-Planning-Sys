<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuildingPlanCheck extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'sbr_db';

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
        'building_review_id',
        'check_type',
        'reviewer_id',
        'findings',
        'recommendations',
        'result',
        'reviewed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Get the building review that owns this check.
     */
    public function buildingReview(): BelongsTo
    {
        return $this->belongsTo(BuildingReview::class, 'building_review_id');
    }
}
