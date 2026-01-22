<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Blacklist extends Model
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
    protected $table = 'blacklist';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'beneficiary_id',
        'reason',
        'details',
        'blacklisted_date',
        'lifted_date',
        'status',
        'blacklisted_by',
        'lifted_by',
        'lift_remarks',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'blacklisted_date' => 'date',
            'lifted_date' => 'date',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($blacklist) {
            if (empty($blacklist->blacklisted_date)) {
                $blacklist->blacklisted_date = now();
            }
        });
    }

    /**
     * Get the beneficiary for this blacklist entry.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Scope to get only active blacklist entries.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
