<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Award extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'hbr_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'award_no',
        'beneficiary_id',
        'application_id',
        'allocation_id',
        'project_id',
        'unit_id',
        'award_status',
        'award_date',
        'acceptance_deadline',
        'accepted_date',
        'declined_date',
        'turnover_date',
        'generated_by',
        'approved_by',
        'approved_at',
        'approval_remarks',
        'rejection_reason',
        'acceptance_remarks',
        'decline_reason',
        'notification_sent',
        'notification_sent_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'award_date' => 'date',
            'acceptance_deadline' => 'date',
            'accepted_date' => 'date',
            'declined_date' => 'date',
            'turnover_date' => 'date',
            'approved_at' => 'datetime',
            'notification_sent' => 'boolean',
            'notification_sent_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($award) {
            if (empty($award->award_no)) {
                $award->award_no = static::generateAwardNo();
            }
        });
    }

    /**
     * Generate a unique award number.
     */
    public static function generateAwardNo(): string
    {
        do {
            $year = date('Y');
            $random = strtoupper(Str::random(8));
            $awardNo = "AWD-{$year}-{$random}";
        } while (static::where('award_no', $awardNo)->exists());

        return $awardNo;
    }

    /**
     * Get the beneficiary for this award.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the application for this award.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(BeneficiaryApplication::class, 'application_id');
    }

    /**
     * Get the allocation for this award.
     */
    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class);
    }

    /**
     * Get the project for this award.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(HousingProject::class, 'project_id');
    }

    /**
     * Get the unit for this award.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(HousingUnit::class, 'unit_id');
    }

    /**
     * Get the user who generated this award.
     */
    public function generator(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(\App\Models\User::class, 'generated_by');
    }

    /**
     * Get the user who approved this award.
     */
    public function approver(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(\App\Models\User::class, 'approved_by');
    }

    /**
     * Accept the award.
     */
    public function accept(?string $remarks = null): void
    {
        $this->update([
            'award_status' => 'accepted',
            'accepted_date' => now(),
            'acceptance_remarks' => $remarks,
        ]);
    }

    /**
     * Decline the award.
     */
    public function decline(string $reason): void
    {
        $this->update([
            'award_status' => 'declined',
            'declined_date' => now(),
            'decline_reason' => $reason,
        ]);
    }

    /**
     * Approve the award.
     */
    public function approve(int $approvedBy, ?string $remarks = null): void
    {
        $this->update([
            'award_status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
            'approval_remarks' => $remarks,
        ]);
    }

    /**
     * Check if award is pending acceptance.
     */
    public function isPendingAcceptance(): bool
    {
        return $this->award_status === 'approved' && $this->accepted_date === null;
    }

    /**
     * Check if award acceptance deadline has passed.
     */
    public function isAcceptanceDeadlinePassed(): bool
    {
        return $this->acceptance_deadline && $this->acceptance_deadline->isPast();
    }
}
