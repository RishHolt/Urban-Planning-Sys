<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuildingUnit extends Model
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
    protected $table = 'BUILDING_UNITS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'building_id',
        'unit_no',
        'floor_number',
        'unit_type',
        'floor_area_sqm',
        'max_occupants',
        'current_occupant_count',
        'status',
        'current_occupant_name',
        'occupancy_start_date',
        'last_inspection_date',
        'next_inspection_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'floor_area_sqm' => 'decimal:2',
            'floor_number' => 'integer',
            'max_occupants' => 'integer',
            'current_occupant_count' => 'integer',
            'occupancy_start_date' => 'date',
            'last_inspection_date' => 'date',
            'next_inspection_date' => 'date',
        ];
    }

    /**
     * Get the building that owns this unit.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get the occupancy records for this unit.
     */
    public function occupancyRecords(): HasMany
    {
        return $this->hasMany(OccupancyRecord::class, 'unit_id');
    }

    /**
     * Get the inspections for this unit.
     */
    public function inspections(): HasMany
    {
        return $this->hasMany(OccupancyInspection::class, 'unit_id');
    }

    /**
     * Get the complaints for this unit.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(OccupancyComplaint::class, 'unit_id');
    }

    /**
     * Get the violations for this unit.
     */
    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class, 'unit_id');
    }

    /**
     * Get the compliance reports for this unit.
     */
    public function complianceReports(): HasMany
    {
        return $this->hasMany(ComplianceReport::class, 'unit_id');
    }
}
