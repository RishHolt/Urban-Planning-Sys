<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ZoningApplication extends ZcsModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'zoning_applications';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_number',
        'reference_no',
        'service_id',
        'user_id',
        'zone_id',
        'applicant_type',
        'is_representative',
        'representative_name',
        'applicant_name',
        'applicant_email',
        'applicant_contact',
        'contact_number',
        'contact_email',
        'valid_id_path',
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
        'lot_owner_contact_number',
        'lot_owner_contact_email',
        'lot_area_total',
        'lot_area_used',
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
        'number_of_storeys',
        'floor_area_sqm',
        'number_of_units',
        'purpose',
        'assessed_fee',
        'status',
        'is_active',
        'submitted_at',
        'processed_at',
        'application_date',
        'notes',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
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
            'lot_area_used' => 'decimal:2',
            'is_representative' => 'boolean',
            'is_subdivision' => 'boolean',
            'has_subdivision_plan' => 'boolean',
            'floor_area_sqm' => 'decimal:2',
            'assessed_fee' => 'decimal:2',
            'is_active' => 'boolean',
            'application_date' => 'date',
            'submitted_at' => 'datetime',
            'processed_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
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
     * Get the user who created this application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the application history records.
     */
    public function history(): HasMany
    {
        return $this->hasMany(ApplicationHistory::class, 'application_id');
    }

    /**
     * Get the external verifications for this application.
     */
    public function verifications(): HasMany
    {
        return $this->hasMany(ExternalVerification::class, 'application_id');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get the documents for the application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ZoningApplicationDocument::class, 'zoning_application_id');
    }

    /**
     * Get the inspection record for the application.
     */
    public function inspection(): HasOne
    {
        return $this->hasOne(Inspection::class, 'application_id');
    }

    /**
     * Get the issued clearance for the application.
     */
    public function issuedClearance(): HasOne
    {
        return $this->hasOne(IssuedClearance::class, 'application_id');
    }

    /**
     * Get the external verifications for this application.
     * Alias for verifications() to match controller/resource usage.
     */
    public function externalVerifications(): HasMany
    {
        return $this->hasMany(ExternalVerification::class, 'application_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ZoningApplicationStatusHistory::class, 'zoning_application_id');
    }

    /**
     * Generate a unique reference number.
     * Format: ZC-YYYY-MM-XXXX
     */
    public static function generateReferenceNo(): string
    {
        $prefix = 'ZC-'.date('Y-m');
        $lastRecord = self::where('reference_no', 'like', "{$prefix}-%")
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastRecord) {
            $parts = explode('-', $lastRecord->reference_no);
            $sequence = (int) end($parts) + 1;
        }

        return $prefix.'-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
