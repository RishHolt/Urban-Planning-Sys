<?php

namespace App\Policies;

use App\Models\User;

class UserManagementPolicy
{
    /**
     * Determine if the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']) || $user->hasAnyRole(['Admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return in_array($user->role, ['super_admin', 'admin']) || $user->hasAnyRole(['Admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'admin']) || $user->hasAnyRole(['Admin']);
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return in_array($user->role, ['super_admin', 'admin']) || $user->hasAnyRole(['Admin']);
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Prevent users from deleting themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Only super_admin can delete users
        return $user->role === 'super_admin' || $user->hasAnyRole(['Admin']);
    }
}
