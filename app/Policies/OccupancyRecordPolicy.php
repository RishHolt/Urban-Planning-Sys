<?php

namespace App\Policies;

use App\Models\OccupancyRecord;
use App\Models\User;

class OccupancyRecordPolicy
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
    public function view(User $user, OccupancyRecord $record): bool
    {
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
    public function update(User $user, OccupancyRecord $record): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OccupancyRecord $record): bool
    {
        return in_array($user->role, ['admin', 'superadmin']);
    }

    /**
     * Determine whether the user can record move-out.
     */
    public function moveOut(User $user, OccupancyRecord $record): bool
    {
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }
}
