<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class UserManagementService
{
    /**
     * Create a new user with profile.
     *
     * @param  array<string, mixed>  $data
     */
    public function createUser(array $data): User
    {
        $userData = [
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'user',
            'is_active' => $data['is_active'] ?? true,
        ];

        $user = User::create($userData);

        $profileData = [
            'first_name' => $data['first_name'] ?? '',
            'middle_name' => $data['middle_name'] ?? null,
            'last_name' => $data['last_name'] ?? '',
            'suffix' => $data['suffix'] ?? null,
            'mobile_number' => $data['mobile_number'] ?? '',
            'street' => $data['street'] ?? '',
            'barangay' => $data['barangay'] ?? '',
            'city' => $data['city'] ?? '',
            'email' => $data['email'],
        ];

        $user->profile()->create($profileData);

        return $user;
    }

    /**
     * Update a user and their profile.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateUser(User $user, array $data): User
    {
        $userData = [];
        if (isset($data['email'])) {
            $userData['email'] = $data['email'];
        }
        if (isset($data['password']) && ! empty($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }
        if (isset($data['role'])) {
            $userData['role'] = $data['role'];
        }
        if (isset($data['is_active'])) {
            $userData['is_active'] = $data['is_active'];
        }

        if (! empty($userData)) {
            $user->update($userData);
        }

        $profileData = [
            'first_name' => $data['first_name'] ?? '',
            'middle_name' => $data['middle_name'] ?? null,
            'last_name' => $data['last_name'] ?? '',
            'suffix' => $data['suffix'] ?? null,
            'mobile_number' => $data['mobile_number'] ?? '',
            'street' => $data['street'] ?? '',
            'barangay' => $data['barangay'] ?? '',
            'city' => $data['city'] ?? '',
            'email' => $data['email'] ?? $user->email,
        ];

        $user->profile()->updateOrCreate(['user_id' => $user->id], $profileData);

        return $user;
    }

    /**
     * Get users with access to a specific module.
     * Since dynamic roles are removed, this now just returns admins and staff.
     *
     * @return Collection<int, User>
     */
    public function getUsersWithAccess(string $moduleCode): Collection
    {
        return User::whereIn('role', ['super_admin', 'admin', 'staff'])->get();
    }
}
