<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Waitlist extends HbrModel
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'waitlist';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'beneficiary_id',
        'application_id',
        'housing_program',
        'priority_score',
        'queue_position',
        'waitlist_date',
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
            'priority_score' => 'integer',
            'queue_position' => 'integer',
            'waitlist_date' => 'date',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($waitlist) {
            if (empty($waitlist->waitlist_date)) {
                $waitlist->waitlist_date = now();
            }
        });
    }

    /**
     * Get the beneficiary for this waitlist entry.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the application for this waitlist entry.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(BeneficiaryApplication::class, 'application_id');
    }
}
