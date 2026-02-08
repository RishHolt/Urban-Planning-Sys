<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SubdivisionApplication extends SbrModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reference_no',
        'user_id',
        'zoning_clearance_no',
        'project_type',
        'applicant_type',
        'contact_number',
        'contact_email',
        'pin_lat',
        'pin_lng',
        'project_address',
        'developer_name',
        'subdivision_name',
        'project_description',
        'total_area_sqm',
        'total_lots_planned',
        'open_space_percentage',
        'building_type',
        'number_of_floors',
        'building_footprint_sqm',
        'total_floor_area_sqm',
        'front_setback_m',
        'rear_setback_m',
        'side_setback_m',
        'floor_area_ratio',
        'building_open_space_sqm',
        'building_review_status',
        'current_stage',
        'status',
        'denial_reason',
        'is_active',
        'submitted_at',
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
            'total_area_sqm' => 'decimal:2',
            'open_space_percentage' => 'decimal:2',
            'building_footprint_sqm' => 'decimal:2',
            'total_floor_area_sqm' => 'decimal:2',
            'front_setback_m' => 'decimal:2',
            'rear_setback_m' => 'decimal:2',
            'side_setback_m' => 'decimal:2',
            'floor_area_ratio' => 'decimal:2',
            'building_open_space_sqm' => 'decimal:2',
            'is_active' => 'boolean',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the documents for this application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(SubdivisionDocument::class, 'application_id');
    }

    /**
     * Get the stage reviews for this application.
     */
    public function stageReviews(): HasMany
    {
        return $this->hasMany(SubdivisionStageReview::class, 'application_id');
    }

    /**
     * Get the issued certificate for this application.
     */
    public function issuedCertificate(): HasOne
    {
        return $this->hasOne(IssuedCertificate::class, 'application_id');
    }

    /**
     * Get the history records for this application.
     */
    public function history(): HasMany
    {
        return $this->hasMany(SbrApplicationHistory::class, 'application_id')
            ->where('application_type', 'subdivision');
    }

    /**
     * Generate a unique reference number.
     */
    public static function generateReferenceNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('reference_no', 'like', "SUB-{$year}-%")
            ->orderBy('reference_no', 'desc')
            ->value('reference_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -5);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('SUB-%s-%05d', $year, $newSequence);
    }
}
