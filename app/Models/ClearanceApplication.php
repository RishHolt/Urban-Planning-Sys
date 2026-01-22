<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ClearanceApplication extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'zcs_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reference_no',
        'user_id',
        'zone_id',
        'application_category',
        'applicant_type',
        'contact_number',
        'contact_email',
        'tax_dec_ref_no',
        'barangay_permit_ref_no',
        'pin_lat',
        'pin_lng',
        'lot_address',
        'province',
        'municipality',
        'barangay',
        'street_name',
        'lot_owner',
        'lot_area_total',
        'is_subdivision',
        'subdivision_name',
        'block_no',
        'lot_no',
        'total_lots_planned',
        'has_subdivision_plan',
        'land_use_type',
        'project_type',
        'building_type',
        'project_description',
        'existing_structure',
        'number_of_storeys',
        'floor_area_sqm',
        'estimated_cost',
        'purpose',
        'assessed_fee',
        'status',
        'denial_reason',
        'is_active',
        'submitted_at',
        'processed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pin_lat' => 'decimal:8',
            'pin_lng' => 'decimal:8',
            'lot_area_total' => 'decimal:2',
            'is_subdivision' => 'boolean',
            'has_subdivision_plan' => 'boolean',
            'floor_area_sqm' => 'decimal:2',
            'estimated_cost' => 'decimal:2',
            'assessed_fee' => 'decimal:2',
            'is_active' => 'boolean',
            'submitted_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * Get the zone for this application.
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Get the documents for this application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'application_id');
    }

    /**
     * Get the history records for this application.
     */
    public function history(): HasMany
    {
        return $this->hasMany(ApplicationHistory::class, 'application_id');
    }

    /**
     * Get the external verifications for this application.
     */
    public function externalVerifications(): HasMany
    {
        return $this->hasMany(ExternalVerification::class, 'application_id');
    }

    /**
     * Get the payment record for this application.
     */
    public function paymentRecord(): HasOne
    {
        return $this->hasOne(PaymentRecord::class, 'application_id');
    }

    /**
     * Get the inspection for this application.
     */
    public function inspection(): HasOne
    {
        return $this->hasOne(Inspection::class, 'application_id');
    }

    /**
     * Get the issued clearance for this application.
     */
    public function issuedClearance(): HasOne
    {
        return $this->hasOne(IssuedClearance::class, 'application_id');
    }

    /**
     * Generate a unique reference number.
     */
    public static function generateReferenceNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('reference_no', 'like', "ZC-{$year}-%")
            ->orderBy('reference_no', 'desc')
            ->value('reference_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -5);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('ZC-%s-%05d', $year, $newSequence);
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('application_category', $category);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
