<?php

namespace App\Services;

use App\Models\Role;

class RoleManagementService
{
    /**
     * Create a new role with module access.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string>  $moduleCodes
     */
    public function createRole(array $data, array $moduleCodes = []): Role
    {
        $role = Role::create($data);

        if (! empty($moduleCodes)) {
            $role->modules()->sync($moduleCodes);
        }

        return $role->load('modules');
    }

    /**
     * Update a role and its module access.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string>  $moduleCodes
     */
    public function updateRole(Role $role, array $data, array $moduleCodes = []): Role
    {
        $role->update($data);

        if (isset($moduleCodes)) {
            $role->modules()->sync($moduleCodes);
        }

        return $role->load('modules');
    }

    /**
     * Check if a role can be deleted.
     */
    public function canDeleteRole(Role $role): bool
    {
        // System roles cannot be deleted
        if ($role->isSystem()) {
            return false;
        }

        // Roles with assigned users cannot be deleted
        if ($role->users()->count() > 0) {
            return false;
        }

        return true;
    }
}
