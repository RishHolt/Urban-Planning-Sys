<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTracking extends Model
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
    protected $table = 'payment_tracking';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'allocation_id',
        'treasury_reference',
        'payment_month',
        'payment_year',
        'amount_due',
        'amount_paid',
        'due_date',
        'payment_date',
        'payment_status',
        'or_number',
        'synced_at',
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
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'due_date' => 'date',
            'payment_date' => 'date',
            'payment_month' => 'integer',
            'payment_year' => 'integer',
            'synced_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->created_at)) {
                $payment->created_at = now();
            }
        });
    }

    /**
     * Get the allocation for this payment tracking.
     */
    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class, 'allocation_id');
    }
}
