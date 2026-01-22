<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HousingBeneficiaryApplication extends Model
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
        'user_id',
        'application_number',
        'application_type',
        'housing_beneficiary_id',
        'household_id',
        'status',
        'submitted_at',
        'reviewed_at',
        'approved_at',
        'reviewed_by',
        'approved_by',
        'application_notes',
        'rejection_reason',
        'admin_notes',
        'eligibility_criteria_met',
        'special_considerations',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Generate a unique application number.
     */
    public static function generateApplicationNumber(): string
    {
        $year = date('Y');
        $lastNumber = self::where('application_number', 'like', "HBR-{$year}-%")
            ->orderBy('application_number', 'desc')
            ->value('application_number');

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
        return $this->belongsTo(HousingBeneficiary::class, 'housing_beneficiary_id');
    }

    /**
     * Get the household for this application.
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the documents for this application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(HousingBeneficiaryDocument::class);
    }

    /**
     * Get the status history for this application.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(HousingBeneficiaryStatusHistory::class);
    }
}
