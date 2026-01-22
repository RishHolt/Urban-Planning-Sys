<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Allocation extends Model
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
    protected $table = 'allocations';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'allocation_no',
        'beneficiary_id',
        'application_id',
        'unit_id',
        'allocation_date',
        'acceptance_deadline',
        'accepted_date',
        'move_in_date',
        'allocation_status',
        'total_contract_price',
        'monthly_amortization',
        'amortization_months',
        'special_conditions',
        'contract_file_path',
        'contract_signed_date',
        'allocated_by',
        'approved_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'allocation_date' => 'date',
            'acceptance_deadline' => 'date',
            'accepted_date' => 'date',
            'move_in_date' => 'date',
            'contract_signed_date' => 'date',
            'total_contract_price' => 'decimal:2',
            'monthly_amortization' => 'decimal:2',
            'amortization_months' => 'integer',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($allocation) {
            if (empty($allocation->allocation_no)) {
                $allocation->allocation_no = static::generateAllocationNo();
            }
        });
    }

    /**
     * Generate a unique allocation number.
     */
    public static function generateAllocationNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('allocation_no', 'like', "ALC-{$year}-%")
            ->orderBy('allocation_no', 'desc')
            ->value('allocation_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('ALC-%s-%04d', $year, $newSequence);
    }

    /**
     * Get the beneficiary for this allocation.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the application for this allocation.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(BeneficiaryApplication::class, 'application_id');
    }

    /**
     * Get the unit for this allocation.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(HousingUnit::class, 'unit_id');
    }

    /**
     * Get the history for this allocation.
     */
    public function history(): HasMany
    {
        return $this->hasMany(AllocationHistory::class, 'allocation_id');
    }

    /**
     * Get the payment tracking for this allocation.
     */
    public function paymentTracking(): HasMany
    {
        return $this->hasMany(PaymentTracking::class, 'allocation_id');
    }

    /**
     * Get the complaints for this allocation.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'allocation_id');
    }
}
