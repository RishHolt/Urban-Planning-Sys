<?php

namespace App\Policies;

use App\Models\HousingProject;
use App\Models\User;

class HousingProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, HousingProject $housingProject): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, HousingProject $housingProject): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, HousingProject $housingProject): bool
    {
        return $user->role === 'admin';
    }
}
