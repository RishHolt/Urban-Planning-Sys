<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HousingProject extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'hbr_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'housing_projects';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_code',
        'project_name',
        'location',
        'barangay',
        'pin_lat',
        'pin_lng',
        'zoning_clearance_no',
        'project_source',
        'source_reference',
        'housing_program',
        'total_units',
        'available_units',
        'allocated_units',
        'occupied_units',
        'lot_area_sqm',
        'unit_floor_area_sqm',
        'unit_price',
        'monthly_amortization',
        'project_status',
        'completion_date',
        'is_active',
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
            'lot_area_sqm' => 'decimal:2',
            'unit_floor_area_sqm' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'monthly_amortization' => 'decimal:2',
            'completion_date' => 'date',
            'is_active' => 'boolean',
            'total_units' => 'integer',
            'available_units' => 'integer',
            'allocated_units' => 'integer',
            'occupied_units' => 'integer',
        ];
    }

    /**
     * Get the units for this project.
     */
    public function units(): HasMany
    {
        return $this->hasMany(HousingUnit::class, 'project_id');
    }

    /**
     * Get the documents for this project.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class, 'project_id');
    }
}
