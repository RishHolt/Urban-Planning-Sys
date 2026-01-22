<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OccupancyComplaint extends Model
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
    protected $table = 'COMPLAINTS';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'complaint_no',
        'building_id',
        'unit_id',
        'complainant_name',
        'complainant_contact',
        'complaint_type',
        'description',
        'priority',
        'status',
        'assigned_to',
        'inspection_id',
        'resolution',
        'resolved_by',
        'resolved_at',
        'submitted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($complaint) {
            if (empty($complaint->complaint_no)) {
                $complaint->complaint_no = static::generateComplaintNo();
            }
            if (empty($complaint->submitted_at)) {
                $complaint->submitted_at = now();
            }
        });
    }

    /**
     * Generate a unique complaint number.
     */
    public static function generateComplaintNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('complaint_no', 'like', "CMP-{$year}-%")
            ->orderBy('complaint_no', 'desc')
            ->value('complaint_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('CMP-%s-%04d', $year, $newSequence);
    }

    /**
     * Get the building for this complaint.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get the unit for this complaint.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(BuildingUnit::class, 'unit_id');
    }

    /**
     * Get the user assigned to this complaint.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the inspection triggered by this complaint.
     */
    public function inspection(): BelongsTo
    {
        return $this->belongsTo(OccupancyInspection::class, 'inspection_id');
    }

    /**
     * Get the user who resolved this complaint.
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
