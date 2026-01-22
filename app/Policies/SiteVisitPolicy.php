<?php

namespace App\Policies;

use App\Models\SiteVisit;
use App\Models\User;

class SiteVisitPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SiteVisit $siteVisit): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SiteVisit $siteVisit): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SiteVisit $siteVisit): bool
    {
        return $user->role === 'admin';
    }
}
