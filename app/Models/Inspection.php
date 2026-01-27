<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inspection extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'zcs_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_id',
        'inspector_id',
        'scheduled_date',
        'findings',
        'result',
        'inspected_at',
        'recommendations',
        'inspection_status',
        'completed_at',
        'reviewed_at',
        'reviewed_by',
        'review_notes',
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
            'inspected_at' => 'datetime',
            'completed_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Get the clearance application that owns this inspection.
     */
    public function clearanceApplication(): BelongsTo
    {
        return $this->belongsTo(ZoningApplication::class, 'application_id');
    }

    /**
     * Get the inspector for this inspection.
     */
    public function inspector(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(User::class, 'inspector_id');
    }

    /**
     * Get the reviewer for this inspection.
     */
    public function reviewer(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the checklist items for this inspection.
     */
    public function checklistItems(): HasMany
    {
        return $this->hasMany(InspectionChecklistItem::class);
    }

    /**
     * Get the photos for this inspection.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ZoningInspectionPhoto::class);
    }

    /**
     * Get the documents for this inspection.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(InspectionDocument::class);
    }
}
