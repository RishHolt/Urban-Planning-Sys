<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HousingUnit extends HbrModel
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'housing_units';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'unit_no',
        'block_no',
        'lot_no',
        'floor_number',
        'unit_type',
        'floor_area_sqm',
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
            'floor_area_sqm' => 'decimal:2',
            'floor_number' => 'integer',
        ];
    }

    /**
     * Get the project that owns the unit.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(HousingProject::class, 'project_id');
    }

    /**
     * Get the allocation for this unit.
     */
    public function allocation(): HasOne
    {
        return $this->hasOne(Allocation::class, 'unit_id');
    }

    /**
     * Get the history for this unit.
     */
    public function history(): HasMany
    {
        return $this->hasMany(UnitHistory::class, 'unit_id');
    }

    /**
     * Get the complaints for this unit.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'unit_id');
    }
}
