<?php

namespace App\Policies;

use App\Models\InfrastructureProjectDocument;
use App\Models\User;

class InfrastructureProjectDocumentPolicy
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
    public function view(User $user, InfrastructureProjectDocument $infrastructureProjectDocument): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, InfrastructureProjectDocument $infrastructureProjectDocument): bool
    {
        return in_array($user->role, ['admin', 'staff']);
    }
}
