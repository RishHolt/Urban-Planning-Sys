<?php

namespace App;

enum ApplicationStatus: string
{
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case SiteVisitScheduled = 'site_visit_scheduled';
    case SiteVisitCompleted = 'site_visit_completed';
    case Verified = 'verified';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Waitlisted = 'waitlisted';
    case Allocated = 'allocated';
    case Cancelled = 'cancelled';

    /**
     * Get the label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'Submitted',
            self::UnderReview => 'Under Review',
            self::SiteVisitScheduled => 'Site Visit Scheduled',
            self::SiteVisitCompleted => 'Site Visit Completed',
            self::Verified => 'Verified',
            self::Approved => 'Approved',
            self::Rejected => 'Rejected',
            self::Waitlisted => 'Waitlisted',
            self::Allocated => 'Allocated',
            self::Cancelled => 'Cancelled',
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
