<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
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
        'zoning_classification_id',
        'label',
        'geometry',
        'is_active',
    ];

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($zone) {
            // Auto-generate label if not provided
            if (empty($zone->label)) {
                $zone->label = 'ZN-'.str_pad((string) random_int(10000000, 99999999), 8, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'geometry' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the zoning classification for this zone.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(ZoningClassification::class, 'zoning_classification_id');
    }

    /**
     * Get the clearance applications for this zone.
     */
    public function clearanceApplications(): HasMany
    {
        return $this->hasMany(ClearanceApplication::class);
    }

    /**
     * Scope a query to only include active zones.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include zones with geometry.
     */
    public function scopeWithGeometry($query)
    {
        return $query->whereNotNull('geometry');
    }
}
