<?php

namespace App;

enum UnitOccupancyStatus: string
{
    case Occupied = 'occupied';
    case Vacant = 'vacant';
    case Abandoned = 'abandoned';

    /**
     * Get the label for the occupancy status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Occupied => 'Occupied',
            self::Vacant => 'Vacant',
            self::Abandoned => 'Abandoned',
        };
    }

    /**
     * Get all occupancy status values as array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
