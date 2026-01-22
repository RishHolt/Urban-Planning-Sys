<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OccupancyHistory extends Model
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
    protected $table = 'OCCUPANCY_HISTORY';

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
        'status',
        'remarks',
        'updated_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the occupancy record that owns this history entry.
     */
    public function occupancyRecord(): BelongsTo
    {
        return $this->belongsTo(OccupancyRecord::class, 'occupancy_record_id');
    }

    /**
     * Get the user who updated this record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
