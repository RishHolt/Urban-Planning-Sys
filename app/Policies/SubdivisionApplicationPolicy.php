<?php

namespace App\Policies;

use App\Models\SubdivisionApplication;
use App\Models\User;

class SubdivisionApplicationPolicy
{
    /**
     * Determine if the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['developer', 'staff', 'admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, SubdivisionApplication $subdivisionApplication): bool
    {
        // Developers can only view their own applications
        if ($user->role === 'developer') {
            return $subdivisionApplication->user_id == $user->id;
        }

        // Staff and admin can view all
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'developer';
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, SubdivisionApplication $subdivisionApplication): bool
    {
        // Only staff and admin can update
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, SubdivisionApplication $subdivisionApplication): bool
    {
        // Only admin can delete
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can review stages.
     */
    public function reviewStage(User $user, SubdivisionApplication $subdivisionApplication): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can issue certificate.
     */
    public function issueCertificate(User $user, SubdivisionApplication $subdivisionApplication): bool
    {
        return $user->role === 'admin';
    }
}
