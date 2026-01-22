<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExternalVerification extends Model
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
        'application_id',
        'verification_type',
        'reference_no',
        'status',
        'response_data',
        'external_system',
        'verified_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'response_data' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Get the clearance application that owns this verification.
     */
    public function clearanceApplication(): BelongsTo
    {
        return $this->belongsTo(ClearanceApplication::class, 'application_id');
    }
}
