<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceReport extends Model
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
    protected $table = 'COMPLIANCE_REPORTS';

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
        'building_id',
        'unit_id',
        'year',
        'quarter',
        'compliance_status',
        'violations_count',
        'inspections_count',
        'summary',
        'generated_at',
        'generated_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'quarter' => 'integer',
            'violations_count' => 'integer',
            'inspections_count' => 'integer',
            'generated_at' => 'datetime',
        ];
    }

    /**
     * Get the building for this compliance report.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get the unit for this compliance report.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(BuildingUnit::class, 'unit_id');
    }

    /**
     * Get the user who generated this report.
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
