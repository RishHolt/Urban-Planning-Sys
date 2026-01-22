<?php

namespace Database\Seeders;

use App\Models\Allocation;
use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\BeneficiaryDocument;
use App\Models\Blacklist;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\Profile;
use App\Models\SiteVisit;
use App\Models\User;
use App\Models\Waitlist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HousingBeneficiarySampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = fake();

        // Get existing users and create more if needed (at least 5 needed)
        $users = User::take(10)->get();
        $neededUsers = 5 - $users->count();

        if ($neededUsers > 0) {
            $this->command->info("Creating {$neededUsers} additional users for seeding...");
            for ($i = 0; $i < $neededUsers; $i++) {
                $user = User::create([
                    'email' => $faker->unique()->safeEmail(),
                    'password' => Hash::make('password'),
                    'role' => 'citizen',
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]);

                Profile::create([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $faker->firstName(),
                    'last_name' => $faker->lastName(),
                    'middle_name' => $faker->optional(0.5)->firstName(),
                    'mobile_number' => '09'.$faker->numerify('#########'),
                    'address' => $faker->address(),
                    'street' => $faker->streetAddress(),
                    'barangay' => $faker->randomElement(['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5']),
                    'city' => 'Manila',
                ]);

                $users->push($user);
            }
            // Refresh collection to ensure we have all users
            $users = User::take(10)->get();
        }

        // 1. Create 5 Beneficiaries
        $this->command->info('Creating 5 Beneficiaries...');
        $beneficiaries = [];
        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $birthDate = $faker->dateTimeBetween('-70 years', '-18 years');
            $isSenior = $birthDate->format('Y') <= (date('Y') - 60);

            $beneficiaries[] = Beneficiary::create([
                'citizen_id' => $user->id,
                'first_name' => $faker->firstName(),
                'middle_name' => $faker->optional(0.7)->firstName(),
                'last_name' => $faker->lastName(),
                'birth_date' => $birthDate,
                'gender' => $faker->randomElement(['male', 'female']),
                'civil_status' => $faker->randomElement(['single', 'married', 'widowed', 'separated', 'live_in']),
                'email' => $faker->unique()->safeEmail(),
                'contact_number' => '09'.$faker->numerify('#########'),
                'current_address' => $faker->address(),
                'barangay' => $faker->randomElement(['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5']),
                'years_of_residency' => $faker->numberBetween(1, 30),
                'employment_status' => $faker->randomElement(['employed', 'self_employed', 'unemployed', 'retired', 'student']),
                'employer_name' => $faker->optional(0.5)->company(),
                'monthly_income' => $faker->randomFloat(2, 5000, 50000),
                'has_existing_property' => $faker->boolean(30),
                'priority_status' => $faker->randomElement(['none', 'pwd', 'senior_citizen', 'solo_parent', 'disaster_victim', 'indigenous']),
                'priority_id_no' => $faker->optional(0.4)->numerify('##########'),
                'is_active' => true,
            ]);
        }

        // 2. Create 5 Housing Projects
        $this->command->info('Creating 5 Housing Projects...');
        $projects = [];
        $housingPrograms = ['socialized_housing', 'relocation', 'rental_subsidy', 'housing_loan'];
        $projectSources = ['lgu_built', 'nha', 'shfc', 'private_developer'];
        $projectStatuses = ['planning', 'under_construction', 'completed', 'fully_allocated'];

        for ($i = 0; $i < 5; $i++) {
            $projects[] = HousingProject::create([
                'project_code' => 'PRJ-'.strtoupper($faker->bothify('???-####')),
                'project_name' => $faker->randomElement(['Sunset', 'Green', 'Harmony', 'Unity', 'Hope']).' '.$faker->randomElement(['Village', 'Homes', 'Residence', 'Estates', 'Community']),
                'location' => $faker->streetAddress(),
                'barangay' => $faker->randomElement(['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5']),
                'pin_lat' => $faker->latitude(14.0, 15.0),
                'pin_lng' => $faker->longitude(120.0, 121.0),
                'zoning_clearance_no' => $faker->optional(0.7)->bothify('ZC-####-####'),
                'project_source' => $faker->randomElement($projectSources),
                'source_reference' => $faker->optional(0.6)->bothify('REF-####'),
                'housing_program' => $faker->randomElement($housingPrograms),
                'total_units' => $faker->numberBetween(20, 100),
                'available_units' => 0, // Will be updated after creation
                'allocated_units' => 0,
                'occupied_units' => 0,
                'lot_area_sqm' => $faker->randomFloat(2, 1000, 10000),
                'unit_floor_area_sqm' => $faker->randomFloat(2, 25, 80),
                'unit_price' => $faker->randomFloat(2, 500000, 2000000),
                'monthly_amortization' => $faker->randomFloat(2, 3000, 15000),
                'project_status' => $faker->randomElement($projectStatuses),
                'completion_date' => $faker->optional(0.6)->dateTimeBetween('-1 year', '+2 years'),
                'is_active' => true,
            ]);
        }

        // Fix available_units after creation
        foreach ($projects as $project) {
            $available = $faker->numberBetween(5, $project->total_units);
            $project->update(['available_units' => $available]);
        }

        // 3. Create 5 Housing Units (one per project)
        $this->command->info('Creating 5 Housing Units...');
        $units = [];
        $unitTypes = ['single_detached', 'duplex', 'rowhouse', 'apartment', 'condominium'];
        $unitStatuses = ['available', 'reserved', 'allocated', 'occupied', 'maintenance'];

        for ($i = 0; $i < 5; $i++) {
            $project = $projects[$i];
            $units[] = HousingUnit::create([
                'project_id' => $project->id,
                'unit_no' => $project->project_code.'-UNIT-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'block_no' => $faker->optional(0.7)->bothify('BLK-###'),
                'lot_no' => $faker->optional(0.7)->bothify('LOT-###'),
                'floor_number' => $faker->optional(0.5)->numberBetween(1, 5),
                'unit_type' => $faker->randomElement($unitTypes),
                'floor_area_sqm' => $faker->randomFloat(2, 25, 80),
                'status' => $faker->randomElement($unitStatuses),
            ]);
        }

        // 4. Create 5 Beneficiary Applications
        $this->command->info('Creating 5 Beneficiary Applications...');
        $applications = [];
        $applicationStatuses = ['submitted', 'under_review', 'site_visit_scheduled', 'site_visit_completed', 'eligible', 'not_eligible', 'waitlisted', 'allocated'];
        $eligibilityStatuses = ['pending', 'eligible', 'not_eligible'];
        $documentTypes = ['valid_id', 'birth_certificate', 'marriage_certificate', 'income_proof', 'barangay_certificate', 'tax_declaration', 'dswd_certification', 'pwd_id', 'senior_citizen_id', 'solo_parent_id', 'disaster_certificate'];

        for ($i = 0; $i < 5; $i++) {
            $beneficiary = $beneficiaries[$i];
            $status = $faker->randomElement($applicationStatuses);
            $eligibility = $faker->randomElement($eligibilityStatuses);

            $applications[] = BeneficiaryApplication::create([
                'beneficiary_id' => $beneficiary->id,
                'housing_program' => $faker->randomElement($housingPrograms),
                'application_reason' => $faker->randomElement([
                    'Need affordable housing',
                    'Disaster victim requiring relocation',
                    'Senior citizen housing assistance',
                    'PWD housing support',
                    'Low-income family housing',
                ]),
                'application_status' => $status,
                'eligibility_status' => $eligibility,
                'eligibility_remarks' => $faker->optional(0.6)->sentence(),
                'denial_reason' => ($status === 'not_eligible' || $eligibility === 'not_eligible') ? $faker->sentence() : null,
                'submitted_at' => $faker->dateTimeBetween('-6 months', 'now'),
                'reviewed_at' => in_array($status, ['under_review', 'eligible', 'not_eligible', 'waitlisted', 'allocated']) ? $faker->dateTimeBetween('-3 months', 'now') : null,
                'reviewed_by' => in_array($status, ['under_review', 'eligible', 'not_eligible', 'waitlisted', 'allocated']) ? $users->random()->id : null,
            ]);

            // Create documents for each application
            foreach ($faker->randomElements($documentTypes, $faker->numberBetween(2, 4)) as $docType) {
                BeneficiaryDocument::create([
                    'beneficiary_id' => $beneficiary->id,
                    'application_id' => $applications[$i]->id,
                    'document_type' => $docType,
                    'file_name' => ucwords(str_replace('_', ' ', $docType)).'.pdf',
                    'file_path' => 'housing-applications/'.$beneficiary->id.'/'.$applications[$i]->application_no.'/'.$faker->uuid().'.pdf',
                    'verification_status' => $faker->randomElement(['pending', 'verified', 'invalid']),
                    'verified_by' => $faker->optional(0.5)->randomElement($users->pluck('id')->toArray()),
                    'verified_at' => $faker->optional(0.5)->dateTimeBetween('-2 months', 'now'),
                ]);
            }
        }

        // 5. Create 5 Site Visits
        $this->command->info('Creating 5 Site Visits...');
        $siteVisits = [];
        $visitStatuses = ['scheduled', 'completed', 'cancelled'];
        $recommendations = ['eligible', 'not_eligible', 'needs_followup'];

        for ($i = 0; $i < 5; $i++) {
            $application = $applications[$i];
            $status = $faker->randomElement($visitStatuses);
            $isCompleted = $status === 'completed';

            $siteVisits[] = SiteVisit::create([
                'beneficiary_id' => $application->beneficiary_id,
                'application_id' => $application->id,
                'visited_by' => $users->random()->id,
                'scheduled_date' => $faker->dateTimeBetween('-3 months', '+1 month'),
                'visit_date' => $isCompleted ? $faker->dateTimeBetween('-2 months', 'now') : null,
                'address_visited' => $faker->address(),
                'living_conditions' => $isCompleted ? $faker->paragraph() : null,
                'findings' => $isCompleted ? $faker->paragraph() : null,
                'recommendation' => $isCompleted ? $faker->randomElement($recommendations) : null,
                'remarks' => $faker->optional(0.5)->sentence(),
                'status' => $status,
            ]);
        }

        // 6. Create 5 Waitlist Entries
        $this->command->info('Creating 5 Waitlist Entries...');
        $waitlistEntries = [];

        for ($i = 0; $i < 5; $i++) {
            $application = $applications[$i];
            $waitlistEntries[] = Waitlist::create([
                'beneficiary_id' => $application->beneficiary_id,
                'application_id' => $application->id,
                'housing_program' => $application->housing_program,
                'priority_score' => $faker->numberBetween(50, 100),
                'queue_position' => $i + 1,
                'waitlist_date' => $faker->dateTimeBetween('-4 months', 'now'),
                'status' => $faker->randomElement(['active', 'allocated', 'removed', 'expired']),
            ]);
        }

        // 7. Create 5 Allocations
        $this->command->info('Creating 5 Allocations...');
        $allocations = [];
        $allocationStatuses = ['proposed', 'committee_review', 'approved', 'rejected', 'accepted', 'declined', 'cancelled', 'moved_in'];

        for ($i = 0; $i < 5; $i++) {
            $application = $applications[$i];
            $unit = $units[$i];
            $status = $faker->randomElement($allocationStatuses);
            $isAccepted = $status === 'accepted' || $status === 'moved_in';

            $allocations[] = Allocation::create([
                'beneficiary_id' => $application->beneficiary_id,
                'application_id' => $application->id,
                'unit_id' => $unit->id,
                'allocation_date' => $faker->dateTimeBetween('-2 months', 'now'),
                'acceptance_deadline' => $faker->dateTimeBetween('now', '+30 days'),
                'accepted_date' => $isAccepted ? $faker->dateTimeBetween('-1 month', 'now') : null,
                'move_in_date' => $status === 'moved_in' ? $faker->dateTimeBetween('-2 weeks', 'now') : null,
                'allocation_status' => $status,
                'total_contract_price' => $faker->randomFloat(2, 500000, 2000000),
                'monthly_amortization' => $faker->randomFloat(2, 3000, 15000),
                'amortization_months' => $faker->numberBetween(60, 360),
                'special_conditions' => $faker->optional(0.4)->sentence(),
                'contract_file_path' => $status === 'moved_in' ? 'contracts/'.$faker->uuid().'.pdf' : null,
                'contract_signed_date' => $status === 'moved_in' ? $faker->dateTimeBetween('-2 weeks', 'now') : null,
                'allocated_by' => $users->random()->id,
                'approved_by' => in_array($status, ['approved', 'accepted', 'moved_in']) ? $users->random()->id : null,
            ]);

            // Update unit status if allocated
            if (in_array($status, ['approved', 'accepted', 'moved_in'])) {
                $unit->update(['status' => 'allocated']);
            }
        }

        // 8. Create 5 Blacklist Entries
        $this->command->info('Creating 5 Blacklist Entries...');
        $blacklistEntries = [];
        $blacklistReasons = [
            'fraud',
            'abandoned_unit',
            'non_payment',
            'subletting',
            'criminal_activity',
            'property_damage',
            'duplicate_benefit',
            'other',
        ];

        for ($i = 0; $i < 5; $i++) {
            $beneficiary = $beneficiaries[$i];
            $isLifted = $faker->boolean(30);

            $blacklistEntries[] = Blacklist::create([
                'beneficiary_id' => $beneficiary->id,
                'reason' => $faker->randomElement($blacklistReasons),
                'details' => $faker->paragraph(),
                'blacklisted_date' => $faker->dateTimeBetween('-1 year', '-1 month'),
                'lifted_date' => $isLifted ? $faker->dateTimeBetween('-1 month', 'now') : null,
                'status' => $isLifted ? 'lifted' : 'active',
                'blacklisted_by' => $users->random()->id,
                'lifted_by' => $isLifted ? $users->random()->id : null,
                'lift_remarks' => $isLifted ? $faker->optional(0.6)->sentence() : null,
            ]);
        }

        $this->command->info('✓ Created 5 Beneficiaries');
        $this->command->info('✓ Created 5 Housing Projects');
        $this->command->info('✓ Created 5 Housing Units');
        $this->command->info('✓ Created 5 Beneficiary Applications');
        $this->command->info('✓ Created 5 Site Visits');
        $this->command->info('✓ Created 5 Waitlist Entries');
        $this->command->info('✓ Created 5 Allocations');
        $this->command->info('✓ Created 5 Blacklist Entries');
        $this->command->info('Housing Beneficiary sample data seeded successfully!');
    }
}
