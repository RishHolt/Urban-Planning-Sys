<?php

namespace App\Models;

use App\BeneficiarySector;
use App\BeneficiaryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Beneficiary extends HbrModel
{
    use HasFactory;

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
        'suffix',
        'birth_date',
        'gender',
        'civil_status',
        'contact_number',
        'mobile_number',
        'telephone_number',
        'email',
        'current_address',
        'address',
        'street',
        'barangay',
        'city',
        'province',
        'zip_code',
        'years_of_residency',
        'employment_status',
        'occupation',
        'employer_name',
        'monthly_income',
        'household_income',
        'has_existing_property',
        'priority_status',
        'priority_id_no',
        'id_type',
        'id_number',
        'sector_tags',
        'beneficiary_status',
        'special_eligibility_notes',
        'is_active',
        'archived_at',
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
            'household_income' => 'decimal:2',
            'has_existing_property' => 'boolean',
            'is_active' => 'boolean',
            'years_of_residency' => 'integer',
            'sector_tags' => 'array',
            'beneficiary_status' => BeneficiaryStatus::class,
            'registered_at' => 'datetime',
            'archived_at' => 'datetime',
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
        if ($this->suffix) {
            $name .= " {$this->suffix}";
        }

        return $name;
    }

    /**
     * Calculate and get the age of the beneficiary.
     */
    public function getAgeAttribute(): int
    {
        return $this->birth_date?->age ?? 0;
    }

    /**
     * Check if beneficiary is a senior citizen (60+ years old).
     */
    public function isSeniorCitizen(): bool
    {
        return $this->age >= 60;
    }

    /**
     * Get the sectors for this beneficiary.
     *
     * @return array<BeneficiarySector>
     */
    public function getSectors(): array
    {
        if (empty($this->sector_tags)) {
            return [];
        }

        return array_map(
            fn ($sector) => BeneficiarySector::from($sector),
            $this->sector_tags
        );
    }

    /**
     * Check if beneficiary belongs to a specific sector.
     */
    public function hasSector(BeneficiarySector $sector): bool
    {
        return in_array($sector->value, $this->sector_tags ?? []);
    }

    /**
     * Add a sector to the beneficiary.
     */
    public function addSector(BeneficiarySector $sector): void
    {
        $sectors = $this->sector_tags ?? [];
        if (! in_array($sector->value, $sectors)) {
            $sectors[] = $sector->value;
            $this->sector_tags = $sectors;
            $this->save();
        }
    }

    /**
     * Remove a sector from the beneficiary.
     */
    public function removeSector(BeneficiarySector $sector): void
    {
        $sectors = $this->sector_tags ?? [];
        $sectors = array_values(array_filter($sectors, fn ($s) => $s !== $sector->value));
        $this->sector_tags = $sectors;
        $this->save();
    }

    /**
     * Archive the beneficiary.
     */
    public function archive(): void
    {
        $this->update([
            'beneficiary_status' => BeneficiaryStatus::Archived,
            'archived_at' => now(),
            'is_active' => false,
        ]);
    }

    /**
     * Restore an archived beneficiary.
     */
    public function restore(): void
    {
        $this->update([
            'beneficiary_status' => BeneficiaryStatus::Applicant,
            'archived_at' => null,
            'is_active' => true,
        ]);
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

    /**
     * Get the user associated with this beneficiary.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'citizen_id');
    }

    /**
     * Get the households that this beneficiary belongs to.
     */
    public function households(): BelongsToMany
    {
        return $this->belongsToMany(Household::class, 'household_members')
            ->withPivot('relationship_to_head', 'membership_status')
            ->withTimestamps();
    }

    /**
     * Get the program assignments for this beneficiary.
     */
    public function programAssignments(): HasMany
    {
        return $this->hasMany(BeneficiaryProgramAssignment::class);
    }

    /**
     * Get the integration records for this beneficiary.
     */
    public function integrationRecords(): HasMany
    {
        return $this->hasMany(BeneficiaryIntegrationRecord::class);
    }

    /**
     * Get the awards for this beneficiary.
     */
    public function awards(): HasMany
    {
        return $this->hasMany(Award::class);
    }
}
