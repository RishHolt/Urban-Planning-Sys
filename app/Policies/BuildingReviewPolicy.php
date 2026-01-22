<?php

namespace App\Policies;

use App\Models\BuildingReview;
use App\Models\User;

class BuildingReviewPolicy
{
    /**
     * Determine if the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, BuildingReview $buildingReview): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        // Building reviews are fetched from P&L, not created by users
        return false;
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, BuildingReview $buildingReview): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can review building plans.
     */
    public function reviewPlan(User $user, BuildingReview $buildingReview): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can POST to Permit & Licensing.
     */
    public function postToPermitLicensing(User $user, BuildingReview $buildingReview): bool
    {
        return $user->role === 'admin';
    }
}
