<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZoningApplication extends Model
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
        'user_id',
        'application_number',
        'service_id',
        'status',
        'submitted_at',
        'applicant_type',
        'applicant_name',
        'applicant_email',
        'applicant_contact',
        'valid_id_path', // Only Valid ID stays in main table
        'company_name',
        'sec_dti_reg_no',
        'authorized_representative',
        'is_property_owner',
        // authorization_letter_path - moved to documents table
        'owner_name',
        'owner_address',
        'owner_contact',
        // proof_of_ownership_path - moved to documents table
        // tax_declaration_type, tax_declaration_id, tax_declaration_path - moved to documents table
        'province',
        'municipality',
        'barangay',
        'lot_no',
        'block_no',
        'street_name',
        'latitude',
        'longitude',
        'land_type',
        'has_existing_structure',
        'number_of_buildings',
        'lot_area',
        'application_type',
        'proposed_use',
        'project_description',
        // site_development_plan_path - moved to documents table
        'previous_use',
        'justification',
        // location_map_path, vicinity_map_path - moved to documents table
        // barangay_clearance_type, barangay_clearance_id, barangay_clearance_path - moved to documents table
        // signature_path - moved to documents table
        'declaration_truthfulness',
        'agreement_compliance',
        'data_privacy_consent',
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
            'submitted_at' => 'datetime',
            'is_property_owner' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'has_existing_structure' => 'boolean',
            'number_of_buildings' => 'integer',
            'lot_area' => 'decimal:2',
            'application_date' => 'date',
            'declaration_truthfulness' => 'boolean',
            'agreement_compliance' => 'boolean',
            'data_privacy_consent' => 'boolean',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the documents for the zoning application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ZoningApplicationDocument::class);
    }

    /**
     * Get the status history for the zoning application.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(ZoningApplicationStatusHistory::class);
    }

    /**
     * Generate a unique application number.
     */
    public static function generateApplicationNumber(): string
    {
        $year = date('Y');
        $lastNumber = self::where('application_number', 'like', "ZON-{$year}-%")
            ->orderBy('application_number', 'desc')
            ->value('application_number');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('ZON-%s-%04d', $year, $newSequence);
    }
}
