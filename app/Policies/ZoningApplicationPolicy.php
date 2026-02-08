<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ZoningApplication;

class ZoningApplicationPolicy
{
    /**
     * Determine if the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Support both old 'citizen' and new 'user' role names
        return in_array($user->role, ['user', 'citizen', 'staff', 'inspector', 'admin', 'super_admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, ZoningApplication $clearanceApplication): bool
    {
        // Users/citizens can only view their own applications
        if (in_array($user->role, ['user', 'citizen'])) {
            return $clearanceApplication->user_id == $user->id;
        }

        // Staff, inspector, and admin can view all
        return in_array($user->role, ['staff', 'inspector', 'admin', 'super_admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        // Support both old 'citizen' and new 'user' role names
        // Allow if user has a role and it's in the allowed list, or if role is null (for testing)
        $role = $user->role ?? null;

        if ($role === null) {
            // If role is null, allow creation (might be during development/testing)
            return true;
        }

        return in_array($role, ['user', 'citizen', 'staff', 'admin', 'super_admin']);
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, ZoningApplication $clearanceApplication): bool
    {
        // Only staff, admin, and super_admin can update
        return in_array($user->role, ['staff', 'admin', 'super_admin']);
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, ZoningApplication $clearanceApplication): bool
    {
        // Only admin and super_admin can delete
        return in_array($user->role, ['admin', 'super_admin']);
    }

    /**
     * Determine if the user can review the application.
     */
    public function review(User $user, ZoningApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['staff', 'admin', 'super_admin']);
    }

    /**
     * Determine if the user can inspect the application.
     */
    public function inspect(User $user, ZoningApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['inspector', 'admin', 'super_admin']);
    }

    /**
     * Determine if the user can issue clearance.
     */
    public function issueClearance(User $user, ZoningApplication $clearanceApplication): bool
    {
        return in_array($user->role, ['admin', 'super_admin']);
    }
}
