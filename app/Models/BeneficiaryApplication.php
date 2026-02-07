<?php

namespace App\Models;

use App\ApplicationStatus;
use App\EligibilityStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BeneficiaryApplication extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'hbr_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'beneficiary_applications';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_no',
        'beneficiary_id',
        'project_id',
        'housing_program',
        'application_reason',
        'application_type',
        'eligibility_status',
        'eligibility_remarks',
        'application_status',
        'denial_reason',
        'rejection_reason',
        'case_officer_id',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'submitted_at',
        'application_notes',
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
            'application_status' => ApplicationStatus::class,
            'eligibility_status' => EligibilityStatus::class,
            'eligibility_criteria_met' => 'boolean',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($application) {
            if (empty($application->application_no)) {
                $application->application_no = static::generateApplicationNo();
            }
            if (empty($application->submitted_at)) {
                $application->submitted_at = now();
            }
        });
    }

    /**
     * Generate a unique application number.
     */
    public static function generateApplicationNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('application_no', 'like', "HBR-{$year}-%")
            ->orderBy('application_no', 'desc')
            ->value('application_no');

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
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the documents for this application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(BeneficiaryDocument::class, 'application_id');
    }

    /**
     * Get the site visits for this application.
     */
    public function siteVisits(): HasMany
    {
        return $this->hasMany(SiteVisit::class, 'application_id');
    }

    /**
     * Get the waitlist entry for this application.
     */
    public function waitlistEntry(): HasOne
    {
        return $this->hasOne(Waitlist::class, 'application_id');
    }

    /**
     * Get the allocation for this application.
     */
    public function allocation(): HasOne
    {
        return $this->hasOne(Allocation::class, 'application_id');
    }

    /**
     * Get the allocation history for this application.
     */
    public function allocationHistory(): HasMany
    {
        return $this->hasManyThrough(AllocationHistory::class, Allocation::class);
    }

    /**
     * Get the project for this application.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(HousingProject::class, 'project_id');
    }

    /**
     * Get the case officer assigned to this application.
     */
    public function caseOfficer(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(\App\Models\User::class, 'case_officer_id');
    }

    /**
     * Get the reviewer for this application.
     */
    public function reviewer(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(\App\Models\User::class, 'reviewed_by');
    }

    /**
     * Get the approver for this application.
     */
    public function approver(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(\App\Models\User::class, 'approved_by');
    }

    /**
     * Get the application history for this application (from audit logs).
     */
    public function getApplicationHistoryAttribute(): array
    {
        return \App\Models\AuditLog::where('resource_type', 'beneficiary_application')
            ->where('resource_id', (string) $this->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($log) {
                return [
                    'action' => $log->action,
                    'changes' => $log->changes,
                    'changed_by' => $log->user_id,
                    'changed_at' => $log->created_at,
                ];
            })
            ->toArray();
    }

    /**
     * Get the evaluations for this application.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(ApplicationEvaluation::class);
    }

    /**
     * Get the awards for this application.
     */
    public function awards(): HasMany
    {
        return $this->hasMany(Award::class, 'application_id');
    }

    /**
     * Check if application can be submitted (multiple applications rules).
     */
    public function canSubmit(): bool
    {
        // Check if beneficiary already has an active application for the same project
        $existing = static::where('beneficiary_id', $this->beneficiary_id)
            ->where('project_id', $this->project_id)
            ->whereIn('application_status', [
                ApplicationStatus::Submitted->value,
                ApplicationStatus::UnderReview->value,
                ApplicationStatus::Verified->value,
                ApplicationStatus::Approved->value,
            ])
            ->where('id', '!=', $this->id)
            ->exists();

        return ! $existing;
    }

    /**
     * Assign a case officer to this application.
     */
    public function assignCaseOfficer(int $caseOfficerId): void
    {
        $this->update(['case_officer_id' => $caseOfficerId]);
    }
}
