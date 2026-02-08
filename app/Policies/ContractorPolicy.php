<?php

namespace App\Policies;

use App\Models\Contractor;
use App\Models\User;

class ContractorPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Contractor $contractor): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Contractor $contractor): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Contractor $contractor): bool
    {
        return $user->role === 'admin';
    }
}
