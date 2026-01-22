<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Occupant extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'omt_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'OCCUPANTS';

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
