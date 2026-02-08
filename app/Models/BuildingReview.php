<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class BuildingReview extends SbrModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pl_reference_no',
        'zoning_clearance_no',
        'building_permit_no',
        'applicant_name',
        'contact_number',
        'project_address',
        'project_description',
        'number_of_storeys',
        'floor_area_sqm',
        'status',
        'denial_reason',
        'fetched_at',
        'reviewed_at',
        'posted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'floor_area_sqm' => 'decimal:2',
            'fetched_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'posted_at' => 'datetime',
        ];
    }

    /**
     * Get the plan checks for this building review.
     */
    public function planChecks(): HasMany
    {
        return $this->hasMany(BuildingPlanCheck::class, 'building_review_id');
    }

    /**
     * Get the history records for this building review.
     */
    public function history(): HasMany
    {
        return $this->hasMany(SbrApplicationHistory::class, 'application_id')
            ->where('application_type', 'building');
    }
}
