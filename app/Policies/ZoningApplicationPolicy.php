<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ZoningApplication;

class ZoningApplicationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view their own applications
        // Admins can view all applications (handled in controller)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ZoningApplication $zoningApplication): bool
    {
        // Users can view their own applications
        if ($user->id === $zoningApplication->user_id) {
            return true;
        }

        // Admins and staff can view any application
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create applications
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ZoningApplication $zoningApplication): bool
    {
        // Users can only update their own applications if status is pending
        if ($user->id === $zoningApplication->user_id && $zoningApplication->status === 'pending') {
            return true;
        }

        // Admins, staff, and superadmins can update any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can update the status of the model.
     */
    public function updateStatus(User $user, ZoningApplication $zoningApplication): bool
    {
        // Only admins, staff, and superadmins can update status
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ZoningApplication $zoningApplication): bool
    {
        // Users can only delete their own applications if status is pending
        if ($user->id === $zoningApplication->user_id && $zoningApplication->status === 'pending') {
            return true;
        }

        // Admins, staff, and superadmins can delete any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ZoningApplication $zoningApplication): bool
    {
        // Only admins, staff, and superadmins can restore
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ZoningApplication $zoningApplication): bool
    {
        // Only admins, staff, and superadmins can force delete
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can upload documents to the application.
     */
    public function uploadDocuments(User $user, ZoningApplication $zoningApplication): bool
    {
        // Users can upload documents to their own applications
        if ($user->id === $zoningApplication->user_id) {
            return true;
        }

        // Admins, staff, and superadmins can upload documents to any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can replace documents in the application.
     */
    public function replaceDocument(User $user, ZoningApplication $zoningApplication): bool
    {
        // Users can replace documents in their own applications
        if ($user->id === $zoningApplication->user_id) {
            return true;
        }

        // Admins, staff, and superadmins can replace documents in any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }
}
