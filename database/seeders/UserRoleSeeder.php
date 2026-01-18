<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Department codes:
     * - ZCS - Zoning Clearance System
     * - SBR - Subdivision & Building Review
     * - HBR - Housing Beneficiary Registry
     * - OMT - Occupancy Monitoring Tool
     * - IPC - Infrastructure Project Coordination
     */
    public function run(): void
    {
        $roles = ['user', 'staff', 'admin', 'superadmin'];
        $departments = ['ZCS', 'SBR', 'HBR', 'OMT', 'IPC'];

        foreach ($roles as $role) {
            $department = $departments[array_rand($departments)];

            // Check if user already exists
            $user = User::where('username', $role)->first();
            
            if (!$user) {
                $user = User::create([
                    'username' => $role,
                    'email' => "{$role}@goserveph.com",
                    'password' => Hash::make('password'),
                    'role' => $role,
                    'email_verified' => true,
                    'email_verified_at' => now(),
                    'department' => $department,
                    'position' => ucfirst($role) . ' Position',
                    'account_no' => User::generateAccountNo($role, $department),
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
                        'birthday' => '1990-01-01',
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
