<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OccupancyRecord extends OmtModel
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'OCCUPANCY_RECORDS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'building_id',
        'unit_id',
        'record_type',
        'start_date',
        'end_date',
        'occupancy_type',
        'purpose_of_use',
        'compliance_status',
        'remarks',
        'recorded_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * Get the building for this occupancy record.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get the unit for this occupancy record.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(BuildingUnit::class, 'unit_id');
    }

    /**
     * Get the user who recorded this occupancy.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Get the occupants for this occupancy record.
     */
    public function occupants(): HasMany
    {
        return $this->hasMany(Occupant::class, 'occupancy_record_id');
    }

    /**
     * Get the history for this occupancy record.
     */
    public function history(): HasMany
    {
        return $this->hasMany(OccupancyHistory::class, 'occupancy_record_id');
    }
}
