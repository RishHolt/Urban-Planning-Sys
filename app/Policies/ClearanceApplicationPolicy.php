<?php

namespace App\Policies;

use App\Models\ClearanceApplication;
use App\Models\User;

class ClearanceApplicationPolicy
{
    /**
     * Determine if the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['citizen', 'staff', 'inspector', 'admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, ClearanceApplication $clearanceApplication): bool
    {
        // Citizens can only view their own applications
        if ($user->role === 'citizen') {
            return $clearanceApplication->user_id === $user->id;
        }

        // Staff, inspector, and admin can view all
        return in_array($user->role, ['staff', 'inspector', 'admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'citizen';
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, ClearanceApplication $clearanceApplication): bool
    {
        // Only staff and admin can update
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, ClearanceApplication $clearanceApplication): bool
    {
        // Only admin can delete
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can review the application.
     */
    public function review(User $user, ClearanceApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can inspect the application.
     */
    public function inspect(User $user, ClearanceApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['inspector', 'admin']);
    }

    /**
     * Determine if the user can issue clearance.
     */
    public function issueClearance(User $user, ClearanceApplication $clearanceApplication): bool
    {
        return $user->role === 'admin';
    }
}
