<?php

namespace App\Policies;

use App\Models\Beneficiary;
use App\Models\User;

class BeneficiaryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view beneficiaries (with filtering in controller)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Beneficiary $beneficiary): bool
    {
        // Users can view their own beneficiary record
        if ($beneficiary->citizen_id == $user->id) {
            return true;
        }

        // Admins, staff, housing officers, social workers, and viewers can view any beneficiary
        return in_array($user->role, [
            'admin',
            'staff',
            'superadmin',
            'housing_officer',
            'social_worker',
            'viewer',
        ]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create beneficiary records (via application)
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Beneficiary $beneficiary): bool
    {
        // Users can update their own beneficiary record
        if ($beneficiary->citizen_id == $user->id) {
            return true;
        }

        // Admins, staff, housing officers, and social workers can update any beneficiary
        return in_array($user->role, [
            'admin',
            'staff',
            'superadmin',
            'housing_officer',
            'social_worker',
        ]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Beneficiary $beneficiary): bool
    {
        // Only admins and superadmins can delete beneficiaries
        return in_array($user->role, ['admin', 'superadmin']);
    }

    /**
     * Determine whether the user can manage sectors for the beneficiary.
     */
    public function manageSectors(User $user, Beneficiary $beneficiary): bool
    {
        // Only admins, staff, housing officers, and social workers can manage sectors
        return in_array($user->role, [
            'admin',
            'staff',
            'superadmin',
            'housing_officer',
            'social_worker',
        ]);
    }

    /**
     * Determine whether the user can update the beneficiary status.
     */
    public function updateStatus(User $user, Beneficiary $beneficiary): bool
    {
        // Only admins, staff, housing officers, and social workers can update status
        return in_array($user->role, [
            'admin',
            'staff',
            'superadmin',
            'housing_officer',
            'social_worker',
        ]);
    }

    /**
     * Determine whether the user can archive the beneficiary.
     */
    public function archive(User $user, Beneficiary $beneficiary): bool
    {
        // Only admins, staff, and superadmins can archive beneficiaries
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can restore an archived beneficiary.
     */
    public function restore(User $user, Beneficiary $beneficiary): bool
    {
        // Only admins, staff, and superadmins can restore archived beneficiaries
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }
}
