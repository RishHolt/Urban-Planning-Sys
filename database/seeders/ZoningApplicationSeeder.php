<?php

namespace Database\Seeders;

use App\Models\ZoningApplication;
use App\Models\Inspection;
use App\Models\User;
use Illuminate\Database\Seeder;

class ZoningApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $citizens = User::where('role', 'user')->get();
        $admins = User::where('role', 'admin')->get();
        $staff = User::where('role', 'staff')->get();

        if ($citizens->isEmpty()) {
            $citizens = User::factory()->count(5)->create(['role' => 'user']);
        }

        $statuses = ['pending', 'under_review', 'for_inspection', 'for_approval', 'approved', 'rejected'];

        foreach (range(1, 10) as $index) {
            $status = $statuses[array_rand($statuses)];
            
            $application = ZoningApplication::factory()->create([
                'user_id' => $citizens->random()->id,
                'status' => $status,
                'reference_no' => ZoningApplication::generateReferenceNo(),
            ]);

            // Add inspections if status is beyond pending
            if ($status !== 'pending') {
                $numInspections = rand(1, 3);
                foreach (range(1, $numInspections) as $i) {
                    Inspection::factory()->create([
                        'application_id' => $application->id,
                        'inspector_id' => $staff->isNotEmpty() ? $staff->random()->id : User::factory()->create(['role' => 'staff'])->id,
                        'inspection_status' => $i === $numInspections && $status === 'for_approval' ? 'completed' : 'reviewed',
                    ]);
                }
            }
        }
    }
}
