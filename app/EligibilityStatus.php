<?php

namespace App;

enum EligibilityStatus: string
{
    case Pending = 'pending';
    case Eligible = 'eligible';
    case NotEligible = 'not_eligible';
    case Conditional = 'conditional';

    /**
     * Get the label for the eligibility status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Eligible => 'Eligible',
            self::NotEligible => 'Not Eligible',
            self::Conditional => 'Conditional',
        };
    }

    /**
     * Get all eligibility status values as array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
