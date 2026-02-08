<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all modules for easy reference
        $zcs = Module::where('code', 'ZCS')->first();
        $hbr = Module::where('code', 'HBR')->first();
        $sbr = Module::where('code', 'SBR')->first();
        $ipc = Module::where('code', 'IPC')->first();
        $omt = Module::where('code', 'OMT')->first();

        $allModules = Module::all();

        // Admin - all modules
        $admin = Role::firstOrCreate(
            ['name' => 'Admin'],
            [
                'description' => 'System administrator with access to all modules',
                'is_system' => true,
            ]
        );
        $admin->modules()->sync($allModules->pluck('code')->toArray());

        // Staff - all modules
        $staff = Role::firstOrCreate(
            ['name' => 'Staff'],
            [
                'description' => 'Government staff with access to all modules',
                'is_system' => true,
            ]
        );
        $staff->modules()->sync($allModules->pluck('code')->toArray());

        // Citizen - no modules (public access only)
        $citizen = Role::firstOrCreate(
            ['name' => 'Citizen'],
            [
                'description' => 'Regular citizens/applicants with no module access',
                'is_system' => true,
            ]
        );
        $citizen->modules()->sync([]);

        // Inspector - ZCS only
        $inspector = Role::firstOrCreate(
            ['name' => 'Inspector'],
            [
                'description' => 'Field inspectors for zoning clearance inspections',
                'is_system' => true,
            ]
        );
        if ($zcs) {
            $inspector->modules()->sync([$zcs->code]);
        }

        // Developer - SBR only
        $developer = Role::firstOrCreate(
            ['name' => 'Developer'],
            [
                'description' => 'Real estate developers for subdivision and building review',
                'is_system' => true,
            ]
        );
        if ($sbr) {
            $developer->modules()->sync([$sbr->code]);
        }

        // Committee Member - HBR only
        $committeeMember = Role::firstOrCreate(
            ['name' => 'Committee Member'],
            [
                'description' => 'Housing committee members for beneficiary registry',
                'is_system' => true,
            ]
        );
        if ($hbr) {
            $committeeMember->modules()->sync([$hbr->code]);
        }

        // Project Manager - IPC only
        $projectManager = Role::firstOrCreate(
            ['name' => 'Project Manager'],
            [
                'description' => 'Project managers for infrastructure project coordination',
                'is_system' => true,
            ]
        );
        if ($ipc) {
            $projectManager->modules()->sync([$ipc->code]);
        }

        // Engineer - IPC and SBR
        $engineer = Role::firstOrCreate(
            ['name' => 'Engineer'],
            [
                'description' => 'Engineers with access to infrastructure and building review',
                'is_system' => true,
            ]
        );
        $engineerModules = [];
        if ($ipc) {
            $engineerModules[] = $ipc->code;
        }
        if ($sbr) {
            $engineerModules[] = $sbr->code;
        }
        $engineer->modules()->sync($engineerModules);
    }
}
