<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HousingBeneficiary extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'birth_date',
        'gender',
        'civil_status',
        'email',
        'mobile_number',
        'telephone_number',
        'address',
        'street',
        'barangay',
        'city',
        'province',
        'zip_code',
        'id_type',
        'id_number',
        'employment_status',
        'occupation',
        'employer_name',
        'monthly_income',
        'household_income',
        'is_indigent',
        'is_senior_citizen',
        'is_pwd',
        'is_single_parent',
        'is_victim_of_disaster',
        'special_eligibility_notes',
        'status',
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
            'is_indigent' => 'boolean',
            'is_senior_citizen' => 'boolean',
            'is_pwd' => 'boolean',
            'is_single_parent' => 'boolean',
            'is_victim_of_disaster' => 'boolean',
        ];
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
     * Get the households that this beneficiary belongs to.
     */
    public function households(): BelongsToMany
    {
        return $this->belongsToMany(Household::class, 'household_members')
            ->withPivot('relationship_to_head', 'membership_status')
            ->withTimestamps();
    }

    /**
     * Get the applications for this beneficiary.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(HousingBeneficiaryApplication::class);
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
}
