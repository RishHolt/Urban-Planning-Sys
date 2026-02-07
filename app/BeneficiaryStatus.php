<?php

namespace App;

enum BeneficiaryStatus: string
{
    case Applicant = 'applicant';
    case Qualified = 'qualified';
    case Waitlisted = 'waitlisted';
    case Awarded = 'awarded';
    case Disqualified = 'disqualified';
    case Archived = 'archived';

    /**
     * Get the label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Applicant => 'Applicant',
            self::Qualified => 'Qualified',
            self::Waitlisted => 'Waitlisted',
            self::Awarded => 'Awarded',
            self::Disqualified => 'Disqualified',
            self::Archived => 'Archived',
        };
    }

    /**
     * Get all status values as array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
