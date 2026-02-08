<?php

namespace App\Policies;

use App\Models\ProjectInspection;
use App\Models\User;

class ProjectInspectionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'inspector', 'project_manager']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProjectInspection $projectInspection): bool
    {
        return in_array($user->role, ['admin', 'staff', 'inspector', 'project_manager']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'inspector']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProjectInspection $projectInspection): bool
    {
        return in_array($user->role, ['admin', 'staff', 'inspector']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProjectInspection $projectInspection): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine whether the user can conduct inspections.
     */
    public function conduct(User $user, ProjectInspection $projectInspection): bool
    {
        return in_array($user->role, ['admin', 'staff', 'inspector']);
    }
}
