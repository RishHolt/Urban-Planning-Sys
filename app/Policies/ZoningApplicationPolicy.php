<?php

namespace App\Policies;

use App\Models\ZoningApplication;
use App\Models\User;

class ZoningApplicationPolicy
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
    public function view(User $user, ZoningApplication $clearanceApplication): bool
    {
        // Citizens can only view their own applications
        if ($user->role === 'citizen') {
            return $clearanceApplication->user_id == $user->id;
        }

        // Staff, inspector, and admin can view all
        return in_array($user->role, ['staff', 'inspector', 'admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['citizen', 'staff', 'admin']);
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, ZoningApplication $clearanceApplication): bool
    {
        // Only staff and admin can update
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, ZoningApplication $clearanceApplication): bool
    {
        // Only admin can delete
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can review the application.
     */
    public function review(User $user, ZoningApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can inspect the application.
     */
    public function inspect(User $user, ZoningApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['inspector', 'admin']);
    }

    /**
     * Determine if the user can issue clearance.
     */
    public function issueClearance(User $user, ZoningApplication $clearanceApplication): bool
    {
        return $user->role === 'admin';
    }
}
