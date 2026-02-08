<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Household extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'household_head_id',
        'household_name',
        'household_number',
        'primary_contact_email',
        'primary_contact_mobile',
        'primary_contact_telephone',
        'address',
        'street',
        'barangay',
        'city',
        'province',
        'zip_code',
        'household_size',
        'number_of_dependents',
        'total_monthly_income',
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
            'household_size' => 'integer',
            'number_of_dependents' => 'integer',
            'total_monthly_income' => 'decimal:2',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($household) {
            if (! $household->household_number) {
                $household->household_number = self::generateHouseholdNumber();
            }
        });
    }

    /**
     * Generate a unique household number.
     */
    public static function generateHouseholdNumber(): string
    {
        $year = date('Y');
        $lastNumber = self::where('household_number', 'like', "HH-{$year}-%")
            ->orderBy('household_number', 'desc')
            ->value('household_number');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('HH-%s-%04d', $year, $newSequence);
    }

    /**
     * Get the household head.
     */
    public function householdHead(): BelongsTo
    {
        return $this->belongsTo(HousingBeneficiary::class, 'household_head_id');
    }

    /**
     * Get the members of this household.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(HousingBeneficiary::class, 'household_members')
            ->withPivot('relationship_to_head', 'membership_status')
            ->withTimestamps();
    }

    /**
     * Get the applications for this household.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(HousingBeneficiaryApplication::class);
    }

    /**
     * Get the program assignments for this household.
     */
    public function programAssignments(): HasMany
    {
        return $this->hasMany(BeneficiaryProgramAssignment::class);
    }

    /**
     * Get the integration records for this household.
     */
    public function integrationRecords(): HasMany
    {
        return $this->hasMany(BeneficiaryIntegrationRecord::class);
    }
}
