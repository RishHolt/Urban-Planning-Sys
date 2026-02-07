<?php

namespace App;

enum BeneficiarySector: string
{
    case ISF = 'isf';
    case PWD = 'pwd';
    case SeniorCitizen = 'senior_citizen';
    case SoloParent = 'solo_parent';
    case LowIncome = 'low_income';
    case DisasterAffected = 'disaster_affected';

    /**
     * Get the label for the sector.
     */
    public function label(): string
    {
        return match ($this) {
            self::ISF => 'Informal Settler',
            self::PWD => 'Person with Disability',
            self::SeniorCitizen => 'Senior Citizen',
            self::SoloParent => 'Solo Parent',
            self::LowIncome => 'Low-income Family',
            self::DisasterAffected => 'Disaster-affected',
        };
    }

    /**
     * Get all sector values as array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
