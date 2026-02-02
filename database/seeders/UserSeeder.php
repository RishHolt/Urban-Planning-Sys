<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Department codes:
     * - ZCS - Zoning Clearance System
     * - SBR - Subdivision & Building Review
     * - HBR - Housing Beneficiary Registry
     * - IPC - Infrastructure Project Coordination
     */
    public function run(): void
    {
        // Seed departments
        $departments = [
            [
                'code' => 'ZCS',
                'name' => 'Zoning Clearance System',
            ],
            [
                'code' => 'SBR',
                'name' => 'Subdivision & Building Review',
            ],
            [
                'code' => 'HBR',
                'name' => 'Housing Beneficiary Registry',
            ],
            [
                'code' => 'IPC',
                'name' => 'Infrastructure Project Coordination',
            ],
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['code' => $department['code']],
                ['name' => $department['name']]
            );
        }

        // Seed users with roles
        $roles = ['citizen', 'staff', 'admin'];

        foreach ($roles as $role) {
            // Check if user already exists
            $user = User::where('email', "{$role}@goserveph.com")->first();

            if (! $user) {
                $user = User::create([
                    'email' => "{$role}@goserveph.com",
                    'password' => Hash::make('password'),
                    'role' => $role,
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]);

                // Only create profile if user was just created
                Profile::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'email' => $user->email,
                        'first_name' => ucfirst($role),
                        'last_name' => 'User',
                        'middle_name' => null,
                        'suffix' => null,
                        'mobile_number' => '09123456789',
                        'address' => '123 Main Street',
                        'street' => 'Main Street',
                        'barangay' => 'Sample Barangay',
                        'city' => 'Sample City',
                    ]
                );
            }
        }
    }
}
