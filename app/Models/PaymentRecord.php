<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRecord extends Model
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
    protected $table = 'payment_records';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_id',
        'or_number',
        'amount',
        'payment_date',
        'treasury_ref',
        'recorded_by',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the clearance application that owns this payment record.
     */
    public function clearanceApplication(): BelongsTo
    {
        return $this->belongsTo(ClearanceApplication::class, 'application_id');
    }
}
