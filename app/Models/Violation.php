<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Violation extends OmtModel
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'VIOLATIONS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'violation_no',
        'building_id',
        'unit_id',
        'inspection_id',
        'violation_type',
        'description',
        'severity',
        'status',
        'violation_date',
        'compliance_deadline',
        'resolved_date',
        'resolution',
        'fine_amount',
        'issued_by',
        'resolved_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'violation_date' => 'date',
            'compliance_deadline' => 'date',
            'resolved_date' => 'date',
            'fine_amount' => 'decimal:2',
        ];
    }

    /**
     * Get the building for this violation.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get the unit for this violation.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(BuildingUnit::class, 'unit_id');
    }

    /**
     * Get the inspection that found this violation.
     */
    public function inspection(): BelongsTo
    {
        return $this->belongsTo(OccupancyInspection::class, 'inspection_id');
    }

    /**
     * Get the user who issued this violation.
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who resolved this violation.
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
