<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Building extends OmtModel
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'BUILDINGS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'building_code',
        'sbr_reference_no',
        'building_permit_no',
        'housing_project_code',
        'building_name',
        'address',
        'pin_lat',
        'pin_lng',
        'owner_name',
        'owner_contact',
        'building_type',
        'structure_source',
        'total_floors',
        'total_units',
        'total_floor_area_sqm',
        'occupancy_status',
        'certificate_of_occupancy_date',
        'last_inspection_date',
        'next_inspection_date',
        'is_active',
        'registered_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pin_lat' => 'decimal:8',
            'pin_lng' => 'decimal:8',
            'total_floor_area_sqm' => 'decimal:2',
            'total_floors' => 'integer',
            'total_units' => 'integer',
            'certificate_of_occupancy_date' => 'date',
            'last_inspection_date' => 'date',
            'next_inspection_date' => 'date',
            'is_active' => 'boolean',
            'registered_at' => 'datetime',
        ];
    }

    /**
     * Get the units for this building.
     */
    public function units(): HasMany
    {
        return $this->hasMany(BuildingUnit::class, 'building_id');
    }

    /**
     * Get the occupancy records for this building.
     */
    public function occupancyRecords(): HasMany
    {
        return $this->hasMany(OccupancyRecord::class, 'building_id');
    }

    /**
     * Get the inspections for this building.
     */
    public function inspections(): HasMany
    {
        return $this->hasMany(OccupancyInspection::class, 'building_id');
    }

    /**
     * Get the violations for this building.
     */
    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class, 'building_id');
    }

    /**
     * Get the complaints for this building.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(OccupancyComplaint::class, 'building_id');
    }
}
