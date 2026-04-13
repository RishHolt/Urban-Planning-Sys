<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $clearance_no
 * @property int $application_id
 * @property int $issued_by
 * @property Carbon $issue_date
 * @property Carbon|null $valid_until
 * @property string|null $conditions
 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property ZoningApplication $clearanceApplication
 */

class IssuedClearance extends ZcsModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'issued_clearances';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'clearance_no',
        'application_id',
        'issued_by',
        'issue_date',
        'valid_until',
        'conditions',
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
            'issue_date' => 'date',
            'valid_until' => 'date',
        ];
    }

    /**
     * Get the clearance application that owns this issued clearance.
     */
    public function clearanceApplication(): BelongsTo
    {
        return $this->belongsTo(ZoningApplication::class, 'application_id');
    }

    /**
     * Get the user who issued/approved this clearance.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'issued_by');
    }

    /**
     * Generate a unique clearance number.
     */
    public static function generateClearanceNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('clearance_no', 'like', "ZC-CLEAR-{$year}-%")
            ->orderBy('clearance_no', 'desc')
            ->value('clearance_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -5);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('ZC-CLEAR-%s-%05d', $year, $newSequence);
    }
}
