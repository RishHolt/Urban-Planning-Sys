<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Occupant extends OmtModel
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'OCCUPANTS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'occupancy_record_id',
        'full_name',
        'contact_number',
        'email',
        'relationship_to_owner',
        'move_in_date',
        'move_out_date',
        'is_primary_occupant',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'move_in_date' => 'date',
            'move_out_date' => 'date',
            'is_primary_occupant' => 'boolean',
        ];
    }

    /**
     * Get the occupancy record that owns this occupant.
     */
    public function occupancyRecord(): BelongsTo
    {
        return $this->belongsTo(OccupancyRecord::class, 'occupancy_record_id');
    }
}
