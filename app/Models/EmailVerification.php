<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class EmailVerification extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'user_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'code',
        'type',
        'expires_at',
        'attempts',
        'max_attempts',
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
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'attempts' => 'integer',
            'max_attempts' => 'integer',
        ];
    }

    /**
     * Check if OTP has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if max attempts exceeded.
     */
    public function isMaxAttemptsReached(): bool
    {
        return $this->attempts >= $this->max_attempts;
    }

    /**
     * Increment attempt counter.
     */
    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    /**
     * Mark OTP as verified.
     */
    public function markAsVerified(): void
    {
        $this->update(['verified_at' => now()]);
    }

    /**
     * Scope a query to only include valid OTPs.
     */
    public function scopeValid(Builder $query): Builder
    {
        return $query->where('expires_at', '>', now())
            ->whereNull('verified_at')
            ->whereColumn('attempts', '<', 'max_attempts');
    }

    /**
     * Scope a query to only include OTPs for a specific email.
     */
    public function scopeForEmail(Builder $query, string $email): Builder
    {
        return $query->where('email', $email);
    }

    /**
     * Scope a query to only include OTPs for a specific type.
     */
    public function scopeForType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }
}
