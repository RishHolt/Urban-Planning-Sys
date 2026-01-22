<?php

namespace App\Policies;

use App\Models\IssuedCertificate;
use App\Models\User;

class IssuedCertificatePolicy
{
    /**
     * Determine if the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, IssuedCertificate $issuedCertificate): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, IssuedCertificate $issuedCertificate): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, IssuedCertificate $issuedCertificate): bool
    {
        return $user->role === 'admin';
    }
}
