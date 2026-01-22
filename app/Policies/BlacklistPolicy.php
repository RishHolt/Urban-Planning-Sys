<?php

namespace App\Policies;

use App\Models\Blacklist;
use App\Models\User;

class BlacklistPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Blacklist $blacklist): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Blacklist $blacklist): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can lift blacklist.
     */
    public function lift(User $user, Blacklist $blacklist): bool
    {
        return $user->role === 'admin';
    }
}
