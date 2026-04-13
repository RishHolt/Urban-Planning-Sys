<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $scheduled_date
 * @property \Illuminate\Support\Carbon|null $inspected_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 */
class Inspection extends ZcsModel
{
    /** @use HasFactory<\Database\Factories\InspectionFactory> */
    use HasFactory;
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
        return $this->belongsTo(User::class, 'inspector_id');
    }

    /**
     * Get the reviewer for this inspection.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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
