<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssuedClearance extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'zcs_db';

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
        return $this->belongsTo(ClearanceApplication::class, 'application_id');
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
