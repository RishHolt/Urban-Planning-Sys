<?php

namespace App\Policies;

use App\Models\Award;
use App\Models\User;

class AwardPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view awards (with filtering in controller)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Award $award): bool
    {
        // Users can view their own awards
        if ($award->beneficiary->citizen_id == $user->id) {
            return true;
        }

        // Admins, staff, housing officers, and viewers can view any award
        return in_array($user->role, [
            'admin',
            'staff',
            'superadmin',
            'housing_officer',
            'viewer',
        ]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins, staff, and housing officers can create awards
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'housing_officer']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Award $award): bool
    {
        // Only admins, staff, and housing officers can update awards
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'housing_officer']);
    }

    /**
     * Determine whether the user can approve the award.
     */
    public function approve(User $user, Award $award): bool
    {
        // Only admins, committee members, and superadmins can approve awards
        return in_array($user->role, ['admin', 'superadmin', 'committee_member']);
    }

    /**
     * Determine whether the user can reject the award.
     */
    public function reject(User $user, Award $award): bool
    {
        // Only admins, committee members, and superadmins can reject awards
        return in_array($user->role, ['admin', 'superadmin', 'committee_member']);
    }

    /**
     * Determine whether the user can accept the award (beneficiary action).
     */
    public function accept(User $user, Award $award): bool
    {
        // Users can accept their own awards
        if ($award->beneficiary->citizen_id == $user->id) {
            return $award->award_status === 'approved' && $award->accepted_date === null;
        }

        return false;
    }

    /**
     * Determine whether the user can decline the award (beneficiary action).
     */
    public function decline(User $user, Award $award): bool
    {
        // Users can decline their own awards
        if ($award->beneficiary->citizen_id == $user->id) {
            return $award->award_status === 'approved' && $award->accepted_date === null;
        }

        return false;
    }

    /**
     * Determine whether the user can schedule turnover for the award.
     */
    public function scheduleTurnover(User $user, Award $award): bool
    {
        // Only admins, staff, and housing officers can schedule turnover
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'housing_officer']);
    }
}
