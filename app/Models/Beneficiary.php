<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Beneficiary extends Model
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
    protected $table = 'beneficiaries';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'beneficiary_no',
        'citizen_id',
        'first_name',
        'middle_name',
        'last_name',
        'birth_date',
        'gender',
        'civil_status',
        'contact_number',
        'email',
        'current_address',
        'barangay',
        'years_of_residency',
        'employment_status',
        'employer_name',
        'monthly_income',
        'has_existing_property',
        'priority_status',
        'priority_id_no',
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
            'birth_date' => 'date',
            'monthly_income' => 'decimal:2',
            'has_existing_property' => 'boolean',
            'is_active' => 'boolean',
            'years_of_residency' => 'integer',
            'registered_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($beneficiary) {
            if (empty($beneficiary->beneficiary_no)) {
                $beneficiary->beneficiary_no = static::generateBeneficiaryNo();
            }
            if (empty($beneficiary->registered_at)) {
                $beneficiary->registered_at = now();
            }
        });
    }

    /**
     * Generate a unique beneficiary number.
     */
    public static function generateBeneficiaryNo(): string
    {
        do {
            $year = date('Y');
            $random = strtoupper(Str::random(8));
            $beneficiaryNo = "BNF-{$year}-{$random}";
        } while (static::where('beneficiary_no', $beneficiaryNo)->exists());

        return $beneficiaryNo;
    }

    /**
     * Get the full name of the beneficiary.
     */
    public function getFullNameAttribute(): string
    {
        $name = trim("{$this->first_name} {$this->middle_name} {$this->last_name}");

        return $name;
    }

    /**
     * Get the applications for this beneficiary.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(BeneficiaryApplication::class);
    }

    /**
     * Get the documents for this beneficiary.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(BeneficiaryDocument::class);
    }

    /**
     * Get the household members for this beneficiary.
     */
    public function householdMembers(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }

    /**
     * Get the site visits for this beneficiary.
     */
    public function siteVisits(): HasMany
    {
        return $this->hasMany(SiteVisit::class);
    }

    /**
     * Get the waitlist entries for this beneficiary.
     */
    public function waitlistEntries(): HasMany
    {
        return $this->hasMany(Waitlist::class);
    }

    /**
     * Get the allocations for this beneficiary.
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }

    /**
     * Get the complaints for this beneficiary.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Get the blacklist entry for this beneficiary.
     */
    public function blacklist(): HasOne
    {
        return $this->hasOne(Blacklist::class);
    }

    /**
     * Check if beneficiary is blacklisted.
     */
    public function isBlacklisted(): bool
    {
        return $this->blacklist()
            ->where('status', 'active')
            ->exists();
    }
}
