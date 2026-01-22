<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Violation extends Model
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
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($violation) {
            if (empty($violation->violation_no)) {
                $violation->violation_no = static::generateViolationNo();
            }
        });
    }

    /**
     * Generate a unique violation number.
     */
    public static function generateViolationNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('violation_no', 'like', "VIO-{$year}-%")
            ->orderBy('violation_no', 'desc')
            ->value('violation_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('VIO-%s-%04d', $year, $newSequence);
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
