<?php

namespace App\Policies;

use App\Models\OccupancyInspection;
use App\Models\User;

class OccupancyInspectionPolicy
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
    public function view(User $user, OccupancyInspection $inspection): bool
    {
        // Inspectors can view their own inspections
        if ($user->role === 'inspector' && $inspection->inspector_id === $user->id) {
            return true;
        }

        return in_array($user->role, ['admin', 'staff', 'superadmin', 'inspector']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OccupancyInspection $inspection): bool
    {
        // Inspectors can update their own inspections
        if ($user->role === 'inspector' && $inspection->inspector_id === $user->id) {
            return true;
        }

        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can complete inspections.
     */
    public function complete(User $user, OccupancyInspection $inspection): bool
    {
        // Inspectors can complete their own inspections
        if ($user->role === 'inspector' && $inspection->inspector_id === $user->id) {
            return true;
        }

        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can upload photos.
     */
    public function uploadPhoto(User $user, OccupancyInspection $inspection): bool
    {
        // Inspectors can upload photos to their own inspections
        if ($user->role === 'inspector' && $inspection->inspector_id === $user->id) {
            return true;
        }

        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }
}
