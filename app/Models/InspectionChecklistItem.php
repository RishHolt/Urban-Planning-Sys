<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionChecklistItem extends ZcsModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'inspection_id',
        'item_name',
        'description',
        'compliance_status',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'compliance_status' => 'string',
        ];
    }

    /**
     * Get the inspection that owns this checklist item.
     */
    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class);
    }
}
