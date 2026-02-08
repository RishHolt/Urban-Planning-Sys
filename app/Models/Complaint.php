<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Complaint extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'complaints';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'complaint_no',
        'allocation_id',
        'beneficiary_id',
        'unit_id',
        'complaint_type',
        'description',
        'priority',
        'status',
        'resolution',
        'assigned_to',
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
     * Get the allocation for this complaint.
     */
    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class, 'allocation_id');
    }

    /**
     * Get the beneficiary for this complaint.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the unit for this complaint.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(HousingUnit::class, 'unit_id');
    }
}
