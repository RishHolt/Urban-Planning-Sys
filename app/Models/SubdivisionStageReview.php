<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubdivisionStageReview extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'sbr_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_id',
        'stage',
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
     * Get the subdivision application that owns this review.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(SubdivisionApplication::class, 'application_id');
    }
}
