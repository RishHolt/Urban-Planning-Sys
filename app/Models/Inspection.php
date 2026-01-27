<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        ];
    }

    /**
     * Get the clearance application that owns this inspection.
     */
    public function clearanceApplication(): BelongsTo
    {
        return $this->belongsTo(ZoningApplication::class, 'application_id');
    }
}
