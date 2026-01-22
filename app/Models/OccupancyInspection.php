<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OccupancyInspection extends Model
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
    protected $table = 'INSPECTIONS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'building_id',
        'unit_id',
        'inspection_type',
        'inspector_id',
        'complaint_id',
        'scheduled_date',
        'inspection_date',
        'findings',
        'compliance_notes',
        'result',
        'recommendations',
        'next_inspection_date',
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
            'inspection_date' => 'date',
            'next_inspection_date' => 'date',
            'inspected_at' => 'datetime',
        ];
    }

    /**
     * Get the building for this inspection.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get the unit for this inspection.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(BuildingUnit::class, 'unit_id');
    }

    /**
     * Get the inspector who conducted this inspection.
     */
    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    /**
     * Get the complaint that triggered this inspection.
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(OccupancyComplaint::class, 'complaint_id');
    }

    /**
     * Get the photos for this inspection.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(InspectionPhoto::class, 'inspection_id');
    }

    /**
     * Get the violations found in this inspection.
     */
    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class, 'inspection_id');
    }
}
