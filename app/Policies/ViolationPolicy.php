<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Violation;

class ViolationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'inspector']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Violation $violation): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'inspector']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'inspector']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Violation $violation): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can issue violations.
     */
    public function issue(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'inspector']);
    }

    /**
     * Determine whether the user can resolve violations.
     */
    public function resolve(User $user, Violation $violation): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'inspector']);
    }
}
