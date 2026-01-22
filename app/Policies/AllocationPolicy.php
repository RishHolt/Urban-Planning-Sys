<?php

namespace App\Policies;

use App\Models\Allocation;
use App\Models\User;

class AllocationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['staff', 'committee_member', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Allocation $allocation): bool
    {
        // Beneficiaries can view their own allocations
        if ($allocation->beneficiary->citizen_id === $user->id) {
            return true;
        }

        return in_array($user->role, ['staff', 'committee_member', 'admin']);
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
    public function update(User $user, Allocation $allocation): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can approve allocations.
     */
    public function approve(User $user, Allocation $allocation): bool
    {
        return in_array($user->role, ['committee_member', 'admin']);
    }

    /**
     * Determine whether the user can accept allocations (beneficiary action).
     */
    public function accept(User $user, Allocation $allocation): bool
    {
        return $allocation->beneficiary->citizen_id === $user->id;
    }
}
