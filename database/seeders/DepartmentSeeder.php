<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
                'code' => 'OMT',
                'name' => 'Occupancy Monitoring Tool',
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
    }
}
