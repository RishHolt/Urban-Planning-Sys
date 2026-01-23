<?php

namespace Database\Seeders;

use App\Models\ClearanceApplication;
use App\Models\Document;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class ClearanceApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users
        $users = User::take(10)->get();
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserRoleSeeder first.');

            return;
        }

        // Get zones (if any exist)
        $zones = Zone::where('is_active', true)->get();

        // Create at least 5 clearance applications
        $faker = fake();
        $statuses = ['pending', 'under_review', 'for_inspection', 'approved', 'denied'];
        $applicationCategories = ['individual_lot', 'subdivision_development'];
        $applicantTypes = ['owner', 'authorized_rep', 'contractor'];
        $landUseTypes = ['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use'];
        $projectTypes = ['new_construction', 'renovation', 'addition', 'change_of_use'];
        $existingStructures = ['none', 'existing_to_retain', 'existing_to_demolish', 'existing_to_renovate'];

        // Manila coordinates
        $manilaLat = 14.5995;
        $manilaLng = 120.9842;

        // Get the last reference number to generate unique ones
        $lastRef = ClearanceApplication::where('reference_no', 'like', 'ZC-'.date('Y').'-%')
            ->orderBy('reference_no', 'desc')
            ->value('reference_no');

        $lastSequence = $lastRef ? (int) substr($lastRef, -5) : 0;

        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $status = $faker->randomElement($statuses);
            $category = $faker->randomElement($applicationCategories);
            $isSubdivision = $category === 'subdivision_development';
            $zone = $zones->isNotEmpty() ? $zones->random() : null;

            // Generate unique reference number
            $year = date('Y');
            $sequence = $lastSequence + $i + 1;
            $referenceNo = sprintf('ZC-%s-%05d', $year, $sequence);

            // Random location near Manila
            $pinLat = $manilaLat + ($faker->randomFloat(4, -0.1, 0.1));
            $pinLng = $manilaLng + ($faker->randomFloat(4, -0.1, 0.1));

            $application = ClearanceApplication::create([
                'reference_no' => $referenceNo,
                'user_id' => $user->id,
                'zone_id' => $zone?->id,
                'application_category' => $category,
                'applicant_type' => $faker->randomElement($applicantTypes),
                'contact_number' => '09'.$faker->numerify('#########'),
                'contact_email' => $faker->unique()->safeEmail(),
                'tax_dec_ref_no' => 'TD-'.$faker->numerify('########'),
                'barangay_permit_ref_no' => 'BP-'.$faker->numerify('########'),
                'pin_lat' => $pinLat,
                'pin_lng' => $pinLng,
                'lot_address' => $faker->streetAddress(),
                'province' => 'Metro Manila',
                'municipality' => $faker->randomElement(['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig']),
                'barangay' => 'Barangay '.$faker->numberBetween(1, 200),
                'street_name' => $faker->streetName(),
                'lot_owner' => $faker->name(),
                'lot_area_total' => $faker->randomFloat(2, 100, 5000),
                'is_subdivision' => $isSubdivision,
                'subdivision_name' => $isSubdivision ? $faker->company().' Subdivision' : null,
                'block_no' => $isSubdivision ? $faker->numberBetween(1, 50) : null,
                'lot_no' => $isSubdivision ? $faker->numberBetween(1, 200) : null,
                'total_lots_planned' => $isSubdivision ? $faker->numberBetween(10, 500) : null,
                'has_subdivision_plan' => $isSubdivision ? $faker->boolean(80) : false,
                'land_use_type' => $faker->randomElement($landUseTypes),
                'project_type' => $faker->randomElement($projectTypes),
                'building_type' => $faker->randomElement(['Single Family', 'Multi-Family', 'Commercial Building', 'Industrial Building', 'Mixed Use']),
                'project_description' => $faker->paragraph(3),
                'existing_structure' => $faker->randomElement($existingStructures),
                'number_of_storeys' => $faker->numberBetween(1, 10),
                'floor_area_sqm' => $faker->randomFloat(2, 50, 1000),
                'purpose' => $faker->sentence(),
                'assessed_fee' => $faker->randomFloat(2, 1000, 50000),
                'status' => $status,
                'denial_reason' => $status === 'denied' ? $faker->sentence() : null,
                'is_active' => true,
                'submitted_at' => $status !== 'pending' ? $faker->dateTimeBetween('-3 months', 'now') : null,
                'processed_at' => in_array($status, ['approved', 'denied']) ? $faker->dateTimeBetween('-2 months', 'now') : null,
            ]);

            // Create sample documents for this application
            $documentTypes = [
                ['name' => 'Tax Declaration', 'type' => 'PDF', 'size' => $faker->numberBetween(100000, 500000)],
                ['name' => 'Barangay Permit', 'type' => 'PDF', 'size' => $faker->numberBetween(80000, 300000)],
                ['name' => 'Site Plan', 'type' => 'PDF', 'size' => $faker->numberBetween(200000, 800000)],
                ['name' => 'Building Plans', 'type' => 'PDF', 'size' => $faker->numberBetween(500000, 2000000)],
                ['name' => 'Property Title', 'type' => 'PDF', 'size' => $faker->numberBetween(150000, 600000)],
            ];

            // Create 2-4 documents per application
            $numDocuments = $faker->numberBetween(2, 4);
            $selectedDocuments = $faker->randomElements($documentTypes, $numDocuments);

            foreach ($selectedDocuments as $docInfo) {
                Document::create([
                    'application_id' => $application->id,
                    'file_name' => $docInfo['name'].'_'.$referenceNo.'.pdf',
                    'file_path' => 'documents/clearance/'.$referenceNo.'/'.$faker->uuid().'.pdf',
                    'file_type' => $docInfo['type'],
                    'file_size' => $docInfo['size'],
                    'uploaded_at' => $application->submitted_at ?? $faker->dateTimeBetween('-3 months', 'now'),
                ]);
            }
        }

        $this->command->info('Clearance applications seeded successfully!');
    }
}
