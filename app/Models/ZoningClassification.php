<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class ZoningClassification extends ZcsModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'allowed_uses',
        'color',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the zones for this classification.
     */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }

    /**
     * Scope a query to only include active classifications.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
