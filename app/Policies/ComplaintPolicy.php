<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
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
    public function view(User $user, Complaint $complaint): bool
    {
        // Beneficiaries can view their own complaints
        if ($complaint->beneficiary->citizen_id === $user->id) {
            return true;
        }

        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'citizen';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Complaint $complaint): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can resolve complaints.
     */
    public function resolve(User $user, Complaint $complaint): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }
}
