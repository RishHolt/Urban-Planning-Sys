<?php

namespace App\Policies;

use App\Models\PhaseMilestone;
use App\Models\User;

class PhaseMilestonePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PhaseMilestone $phaseMilestone): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PhaseMilestone $phaseMilestone): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PhaseMilestone $phaseMilestone): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }
}
