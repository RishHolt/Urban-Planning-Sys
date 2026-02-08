<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BeneficiaryIntegrationRecord extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'housing_beneficiary_id',
        'household_id',
        'integration_type',
        'external_record_id',
        'external_system_name',
        'integration_data',
        'last_synced_at',
        'sync_status',
        'sync_notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'integration_data' => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    /**
     * Get the beneficiary for this integration record.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(HousingBeneficiary::class, 'housing_beneficiary_id');
    }

    /**
     * Get the household for this integration record.
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
}
