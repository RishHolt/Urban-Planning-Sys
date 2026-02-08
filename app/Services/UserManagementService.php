<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserManagementService
{
    /**
     * Create a new user with roles.
     *
     * @param  array<string, mixed>  $data
     * @param  array<int>  $roleIds
     */
    public function createUser(array $data, array $roleIds = []): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user = User::create($data);

        if (! empty($roleIds)) {
            $user->roles()->sync($roleIds);
        }

        return $user->load('roles');
    }

    /**
     * Update a user and their roles.
     *
     * @param  array<string, mixed>  $data
     * @param  array<int>  $roleIds
     */
    public function updateUser(User $user, array $data, array $roleIds = []): User
    {
        if (isset($data['password']) && ! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        if (isset($roleIds)) {
            $user->roles()->sync($roleIds);
        }

        return $user->load('roles');
    }

    /**
     * Get users with access to a specific module.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, User>
     */
    public function getUsersWithAccess(string $moduleCode)
    {
        return User::whereHas('roles.modules', function ($query) use ($moduleCode) {
            $query->where('code', $moduleCode);
        })
            ->orWhereIn('role', ['super_admin', 'admin', 'staff'])
            ->get();
    }
}
