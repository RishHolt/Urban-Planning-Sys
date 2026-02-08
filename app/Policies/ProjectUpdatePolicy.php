<?php

namespace App\Policies;

use App\Models\ProjectUpdate;
use App\Models\User;

class ProjectUpdatePolicy
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
    public function view(User $user, ProjectUpdate $projectUpdate): bool
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
    public function update(User $user, ProjectUpdate $projectUpdate): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProjectUpdate $projectUpdate): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }
}
