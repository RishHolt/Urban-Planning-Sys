<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'code' => 'ZCS',
                'name' => 'Zoning Clearance System',
                'description' => 'Manage zoning clearance applications for individual lots and subdivision developments',
                'is_active' => true,
            ],
            [
                'code' => 'HBR',
                'name' => 'Housing Beneficiary Registry',
                'description' => 'Manage government housing programs for qualified beneficiaries',
                'is_active' => true,
            ],
            [
                'code' => 'SBR',
                'name' => 'Subdivision & Building Review',
                'description' => 'Review and approve subdivision developments and building plans',
                'is_active' => true,
            ],
            [
                'code' => 'IPC',
                'name' => 'Infrastructure Project Coordination',
                'description' => 'Coordinate and manage infrastructure projects',
                'is_active' => true,
            ],
            [
                'code' => 'OMT',
                'name' => 'Occupancy Monitoring Tool',
                'description' => 'Monitor building occupancy and compliance',
                'is_active' => true,
            ],
        ];

        foreach ($modules as $module) {
            Module::firstOrCreate(
                ['code' => $module['code']],
                $module
            );
        }
    }
}
