<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BeneficiaryApplication extends Model
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
    protected $table = 'beneficiary_applications';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_no',
        'beneficiary_id',
        'housing_program',
        'application_reason',
        'eligibility_status',
        'eligibility_remarks',
        'application_status',
        'denial_reason',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
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
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($application) {
            if (empty($application->application_no)) {
                $application->application_no = static::generateApplicationNo();
            }
            if (empty($application->submitted_at)) {
                $application->submitted_at = now();
            }
        });
    }

    /**
     * Generate a unique application number.
     */
    public static function generateApplicationNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('application_no', 'like', "HBR-{$year}-%")
            ->orderBy('application_no', 'desc')
            ->value('application_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('HBR-%s-%04d', $year, $newSequence);
    }

    /**
     * Get the beneficiary for this application.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the documents for this application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(BeneficiaryDocument::class, 'application_id');
    }

    /**
     * Get the site visits for this application.
     */
    public function siteVisits(): HasMany
    {
        return $this->hasMany(SiteVisit::class, 'application_id');
    }

    /**
     * Get the waitlist entry for this application.
     */
    public function waitlistEntry(): HasOne
    {
        return $this->hasOne(Waitlist::class, 'application_id');
    }

    /**
     * Get the allocation for this application.
     */
    public function allocation(): HasOne
    {
        return $this->hasOne(Allocation::class, 'application_id');
    }

    /**
     * Get the allocation history for this application.
     */
    public function allocationHistory(): HasMany
    {
        return $this->hasManyThrough(AllocationHistory::class, Allocation::class);
    }
}
