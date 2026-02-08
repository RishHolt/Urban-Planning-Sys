<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZoningApplicationStatusHistory extends ZcsModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'zoning_application_status_history';

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
        'zoning_application_id',
        'status_from',
        'status_to',
        'changed_by',
        'notes',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the zoning application that owns the status history entry.
     */
    public function zoningApplication(): BelongsTo
    {
        return $this->belongsTo(ZoningApplication::class);
    }
}
