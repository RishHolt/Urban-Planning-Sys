<?php

namespace App\Models;

class ComplianceRule extends ZcsModel
{
    protected $fillable = [
        'classification_code',
        'name',
        'allowed_uses',
        'front_setback',
        'rear_setback',
        'side_setback',
        'floor_area_ratio',
        'max_height',
        'max_storeys',
        'open_space_requirement',
        'min_lot_area',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'allowed_uses' => 'array',
            'front_setback' => 'decimal:2',
            'rear_setback' => 'decimal:2',
            'side_setback' => 'decimal:2',
            'floor_area_ratio' => 'decimal:2',
            'max_height' => 'decimal:2',
            'min_lot_area' => 'decimal:2',
            'open_space_requirement' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Convert to the rules array format used by ComplianceCheckerService.
     */
    public function toRulesArray(): array
    {
        return [
            'name' => $this->name,
            'allowed_uses' => $this->allowed_uses ?? [],
            'setbacks' => [
                'front' => (float) $this->front_setback,
                'rear' => (float) $this->rear_setback,
                'side' => (float) $this->side_setback,
            ],
            'floor_area_ratio' => (float) $this->floor_area_ratio,
            'max_height' => (float) $this->max_height,
            'max_storeys' => (int) $this->max_storeys,
            'open_space_requirement' => (float) $this->open_space_requirement,
            'min_lot_area' => (float) $this->min_lot_area,
        ];
    }
}
