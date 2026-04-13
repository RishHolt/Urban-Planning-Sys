<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default Admin
        User::updateOrCreate(
            ['email' => 'admin@urban.gov.ph'],
            [
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // 10 Admins
        $citizens = User::where('role', 'user')->get();
        $admins = User::where('role', 'admin')->get();
        $staff = User::where('role', 'staff')->get();

        if ($citizens->isEmpty()) {
            $citizens = User::factory()->count(5)->create(['role' => 'user']);
        }
        
        // Default Citizen for testing
        User::updateOrCreate(
            ['email' => 'user@urban.gov.ph'],
            [
                'password' => Hash::make('password'),
                'role' => 'user',
                'is_active' => true,
            ]
        );
    }
}
