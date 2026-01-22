<?php

namespace Database\Seeders;

use App\Models\BeneficiaryProgramAssignment;
use App\Models\Household;
use App\Models\HousingBeneficiary;
use App\Models\HousingBeneficiaryApplication;
use App\Models\HousingBeneficiaryDocument;
use App\Models\HousingBeneficiaryStatusHistory;
use App\Models\HousingProgram;
use App\Models\User;
use Illuminate\Database\Seeder;

class HousingBeneficiarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create sample users
        $users = User::take(10)->get();
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserRoleSeeder first.');

            return;
        }

        // Create Housing Programs
        $programs = $this->createHousingPrograms();

        // Create Individual Beneficiaries
        $individualBeneficiaries = $this->createIndividualBeneficiaries($users);

        // Create Households with Members
        $households = $this->createHouseholds($users);

        // Create Applications
        $this->createApplications($users, $individualBeneficiaries, $households, $programs);

        $this->command->info('HBR sample data seeded successfully!');
    }

    /**
     * Create housing programs.
     */
    private function createHousingPrograms(): array
    {
        $programs = [
            [
                'name' => 'Socialized Housing Program',
                'code' => 'SHP',
                'description' => 'Provides affordable housing units for low-income families',
                'eligibility_criteria' => 'Monthly income below PHP 30,000, Filipino citizen, at least 18 years old',
                'max_income_threshold' => 30000.00,
                'max_household_size' => 6,
                'start_date' => now()->subYear(),
                'end_date' => now()->addYears(5),
                'status' => 'active',
            ],
            [
                'name' => 'Resettlement Program',
                'code' => 'RP',
                'description' => 'Relocation assistance for families affected by disasters or infrastructure projects',
                'eligibility_criteria' => 'Victim of disaster or infrastructure displacement, valid proof of residence',
                'max_income_threshold' => 50000.00,
                'max_household_size' => 8,
                'start_date' => now()->subMonths(6),
                'end_date' => now()->addYears(3),
                'status' => 'active',
            ],
            [
                'name' => 'Senior Citizen Housing Program',
                'code' => 'SCHP',
                'description' => 'Specialized housing assistance for senior citizens',
                'eligibility_criteria' => 'Age 60 and above, Filipino citizen, low to moderate income',
                'max_income_threshold' => 25000.00,
                'max_household_size' => 4,
                'start_date' => now()->subMonths(3),
                'end_date' => now()->addYears(4),
                'status' => 'active',
            ],
            [
                'name' => 'PWD Housing Assistance',
                'code' => 'PWHA',
                'description' => 'Housing support for persons with disabilities',
                'eligibility_criteria' => 'Valid PWD ID, Filipino citizen, proof of disability',
                'max_income_threshold' => 35000.00,
                'max_household_size' => 5,
                'start_date' => now()->subYear(),
                'end_date' => now()->addYears(5),
                'status' => 'active',
            ],
        ];

        $createdPrograms = [];
        foreach ($programs as $program) {
            $createdPrograms[] = HousingProgram::firstOrCreate(
                ['code' => $program['code']],
                $program
            );
        }

        return $createdPrograms;
    }

    /**
     * Create individual beneficiaries.
     */
    private function createIndividualBeneficiaries($users): array
    {
        $beneficiaries = [];
        $faker = fake();

        for ($i = 0; $i < 15; $i++) {
            $user = $users->random();
            $gender = $faker->randomElement(['male', 'female']);
            $birthDate = $faker->dateTimeBetween('-70 years', '-18 years');
            $isSeniorCitizen = $birthDate->format('Y') <= (date('Y') - 60);

            $beneficiary = HousingBeneficiary::create([
                'user_id' => $user->id,
                'first_name' => $faker->firstName(),
                'last_name' => $faker->lastName(),
                'middle_name' => $faker->optional(0.7)->firstName(),
                'suffix' => $faker->optional(0.1)->randomElement(['Jr.', 'Sr.', 'II', 'III']),
                'birth_date' => $birthDate,
                'gender' => $gender,
                'civil_status' => $faker->randomElement(['single', 'married', 'widowed', 'divorced', 'separated']),
                'email' => $faker->unique()->safeEmail(),
                'mobile_number' => '09'.$faker->numerify('#########'),
                'telephone_number' => $faker->optional(0.3)->numerify('####-####'),
                'address' => $faker->address(),
                'street' => $faker->streetAddress(),
                'barangay' => $faker->randomElement(['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5']),
                'city' => 'Manila',
                'province' => 'Metro Manila',
                'zip_code' => $faker->postcode(),
                'id_type' => $faker->randomElement(['philhealth', 'sss', 'tin', 'passport', 'driver_license']),
                'id_number' => $faker->numerify('##########'),
                'employment_status' => $faker->randomElement(['employed', 'unemployed', 'self_employed', 'retired', 'student', 'other']),
                'occupation' => $faker->optional(0.7)->jobTitle(),
                'employer_name' => $faker->optional(0.5)->company(),
                'monthly_income' => $faker->randomFloat(2, 5000, 50000),
                'household_income' => $faker->randomFloat(2, 10000, 80000),
                'is_indigent' => $faker->boolean(30),
                'is_senior_citizen' => $isSeniorCitizen,
                'is_pwd' => $faker->boolean(20),
                'is_single_parent' => $faker->boolean(15),
                'is_victim_of_disaster' => $faker->boolean(10),
                'special_eligibility_notes' => $faker->optional(0.3)->sentence(),
                'status' => $faker->randomElement(['active', 'active', 'active', 'inactive']), // Mostly active
            ]);

            $beneficiaries[] = $beneficiary;
        }

        return $beneficiaries;
    }

    /**
     * Create households with members.
     */
    private function createHouseholds($users): array
    {
        $households = [];
        $faker = fake();

        for ($i = 0; $i < 8; $i++) {
            $user = $users->random();

            // Create household head first
            $head = HousingBeneficiary::create([
                'user_id' => $user->id,
                'first_name' => $faker->firstName('male'),
                'last_name' => $faker->lastName(),
                'middle_name' => $faker->optional(0.7)->firstName(),
                'suffix' => $faker->optional(0.1)->randomElement(['Jr.', 'Sr.']),
                'birth_date' => $faker->dateTimeBetween('-60 years', '-25 years'),
                'gender' => 'male',
                'civil_status' => 'married',
                'email' => $faker->unique()->safeEmail(),
                'mobile_number' => '09'.$faker->numerify('#########'),
                'telephone_number' => $faker->optional(0.3)->numerify('####-####'),
                'address' => $faker->address(),
                'street' => $faker->streetAddress(),
                'barangay' => $faker->randomElement(['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5']),
                'city' => 'Manila',
                'province' => 'Metro Manila',
                'zip_code' => $faker->postcode(),
                'id_type' => $faker->randomElement(['philhealth', 'sss', 'tin']),
                'id_number' => $faker->numerify('##########'),
                'employment_status' => $faker->randomElement(['employed', 'self_employed']),
                'occupation' => $faker->jobTitle(),
                'employer_name' => $faker->optional(0.5)->company(),
                'monthly_income' => $faker->randomFloat(2, 15000, 60000),
                'household_income' => $faker->randomFloat(2, 30000, 100000),
                'is_indigent' => $faker->boolean(25),
                'is_senior_citizen' => false,
                'is_pwd' => $faker->boolean(10),
                'is_single_parent' => false,
                'is_victim_of_disaster' => $faker->boolean(15),
                'status' => 'active',
            ]);

            // Create household
            $householdSize = $faker->numberBetween(3, 7);
            $household = Household::create([
                'household_head_id' => $head->id,
                'household_name' => $faker->optional(0.6)->company().' Family',
                'primary_contact_email' => $head->email,
                'primary_contact_mobile' => $head->mobile_number,
                'primary_contact_telephone' => $head->telephone_number,
                'address' => $head->address,
                'street' => $head->street,
                'barangay' => $head->barangay,
                'city' => $head->city,
                'province' => $head->province,
                'zip_code' => $head->zip_code,
                'household_size' => $householdSize,
                'number_of_dependents' => $faker->numberBetween(0, $householdSize - 1),
                'total_monthly_income' => $head->household_income,
                'status' => 'active',
            ]);

            // Attach head as member
            $household->members()->attach($head->id, [
                'relationship_to_head' => 'head',
                'membership_status' => 'active',
            ]);

            // Create and attach additional members
            $relationships = ['spouse', 'child', 'child', 'child', 'parent', 'sibling', 'other'];
            for ($j = 1; $j < $householdSize; $j++) {
                $member = HousingBeneficiary::create([
                    'user_id' => null, // Members may not have user accounts
                    'first_name' => $faker->firstName(),
                    'last_name' => $head->last_name, // Usually same last name
                    'middle_name' => $faker->optional(0.6)->firstName(),
                    'birth_date' => $faker->dateTimeBetween('-50 years', '-5 years'),
                    'gender' => $faker->randomElement(['male', 'female']),
                    'civil_status' => $faker->randomElement(['single', 'married']),
                    'email' => $faker->optional(0.4)->safeEmail(),
                    'mobile_number' => '09'.$faker->numerify('#########'),
                    'address' => $head->address,
                    'street' => $head->street,
                    'barangay' => $head->barangay,
                    'city' => $head->city,
                    'province' => $head->province,
                    'zip_code' => $head->zip_code,
                    'employment_status' => $faker->randomElement(['employed', 'unemployed', 'student', 'other']),
                    'monthly_income' => $faker->optional(0.5)->randomFloat(2, 0, 30000),
                    'status' => 'active',
                ]);

                $household->members()->attach($member->id, [
                    'relationship_to_head' => $relationships[min($j - 1, count($relationships) - 1)],
                    'membership_status' => 'active',
                ]);
            }

            $households[] = $household;
        }

        return $households;
    }

    /**
     * Create applications with documents and status history.
     */
    private function createApplications($users, $individualBeneficiaries, $households, $programs): void
    {
        $faker = fake();
        $statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
        $documentTypes = ['proof_of_identity', 'proof_of_income', 'proof_of_residence', 'special_eligibility_certificate'];

        // Create individual applications
        foreach (array_slice($individualBeneficiaries, 0, 10) as $beneficiary) {
            $status = $faker->randomElement($statuses);
            $user = $users->random();

            $application = HousingBeneficiaryApplication::create([
                'user_id' => $user->id,
                'application_number' => HousingBeneficiaryApplication::generateApplicationNumber(),
                'application_type' => 'individual',
                'housing_beneficiary_id' => $beneficiary->id,
                'household_id' => null,
                'status' => $status,
                'submitted_at' => $status !== 'draft' ? $faker->dateTimeBetween('-3 months', 'now') : null,
                'reviewed_at' => in_array($status, ['under_review', 'approved', 'rejected']) ? $faker->dateTimeBetween('-2 months', 'now') : null,
                'approved_at' => $status === 'approved' ? $faker->dateTimeBetween('-1 month', 'now') : null,
                'reviewed_by' => in_array($status, ['under_review', 'approved', 'rejected']) ? $users->random()->id : null,
                'approved_by' => $status === 'approved' ? $users->random()->id : null,
                'application_notes' => $faker->optional(0.4)->sentence(),
                'rejection_reason' => $status === 'rejected' ? $faker->sentence() : null,
                'admin_notes' => in_array($status, ['under_review', 'approved', 'rejected']) ? $faker->optional(0.5)->sentence() : null,
                'eligibility_criteria_met' => $status === 'approved' ? 'All eligibility criteria verified and met.' : null,
                'special_considerations' => $faker->optional(0.2)->sentence(),
            ]);

            // Create documents
            foreach ($documentTypes as $docType) {
                HousingBeneficiaryDocument::create([
                    'housing_beneficiary_application_id' => $application->id,
                    'document_type' => $docType,
                    'type' => 'upload',
                    'file_path' => 'documents/sample/'.$faker->uuid().'.pdf',
                    'file_name' => ucwords(str_replace('_', ' ', $docType)).'.pdf',
                    'file_size' => $faker->numberBetween(100000, 5000000),
                    'mime_type' => 'application/pdf',
                    'status' => $status === 'approved' ? 'approved' : ($status === 'rejected' ? $faker->randomElement(['pending', 'rejected']) : 'pending'),
                    'reviewed_by' => $status === 'approved' ? $users->random()->id : null,
                    'reviewed_at' => $status === 'approved' ? $faker->dateTimeBetween('-1 month', 'now') : null,
                    'version' => 1,
                    'is_current' => true,
                ]);
            }

            // Create status history
            $this->createStatusHistory($application, $users);

            // Assign to program (if approved)
            if ($status === 'approved' && $faker->boolean(70)) {
                BeneficiaryProgramAssignment::create([
                    'housing_beneficiary_id' => $beneficiary->id,
                    'household_id' => null,
                    'housing_program_id' => $faker->randomElement($programs)->id,
                    'assigned_date' => $application->approved_at?->toDateString(),
                    'status' => $faker->randomElement(['pending', 'active']),
                    'notes' => $faker->optional(0.3)->sentence(),
                    'assigned_by' => $users->random()->id,
                ]);
            }
        }

        // Create household applications
        foreach (array_slice($households, 0, 5) as $household) {
            $status = $faker->randomElement($statuses);
            $user = $users->random();

            $application = HousingBeneficiaryApplication::create([
                'user_id' => $user->id,
                'application_number' => HousingBeneficiaryApplication::generateApplicationNumber(),
                'application_type' => 'household',
                'housing_beneficiary_id' => null,
                'household_id' => $household->id,
                'status' => $status,
                'submitted_at' => $status !== 'draft' ? $faker->dateTimeBetween('-3 months', 'now') : null,
                'reviewed_at' => in_array($status, ['under_review', 'approved', 'rejected']) ? $faker->dateTimeBetween('-2 months', 'now') : null,
                'approved_at' => $status === 'approved' ? $faker->dateTimeBetween('-1 month', 'now') : null,
                'reviewed_by' => in_array($status, ['under_review', 'approved', 'rejected']) ? $users->random()->id : null,
                'approved_by' => $status === 'approved' ? $users->random()->id : null,
                'application_notes' => $faker->optional(0.4)->sentence(),
                'rejection_reason' => $status === 'rejected' ? $faker->sentence() : null,
                'admin_notes' => in_array($status, ['under_review', 'approved', 'rejected']) ? $faker->optional(0.5)->sentence() : null,
                'eligibility_criteria_met' => $status === 'approved' ? 'All eligibility criteria verified and met.' : null,
                'special_considerations' => $faker->optional(0.2)->sentence(),
            ]);

            // Create documents
            foreach ($documentTypes as $docType) {
                HousingBeneficiaryDocument::create([
                    'housing_beneficiary_application_id' => $application->id,
                    'document_type' => $docType,
                    'type' => 'upload',
                    'file_path' => 'documents/sample/'.$faker->uuid().'.pdf',
                    'file_name' => ucwords(str_replace('_', ' ', $docType)).'.pdf',
                    'file_size' => $faker->numberBetween(100000, 5000000),
                    'mime_type' => 'application/pdf',
                    'status' => $status === 'approved' ? 'approved' : ($status === 'rejected' ? $faker->randomElement(['pending', 'rejected']) : 'pending'),
                    'reviewed_by' => $status === 'approved' ? $users->random()->id : null,
                    'reviewed_at' => $status === 'approved' ? $faker->dateTimeBetween('-1 month', 'now') : null,
                    'version' => 1,
                    'is_current' => true,
                ]);
            }

            // Create status history
            $this->createStatusHistory($application, $users);

            // Assign to program (if approved)
            if ($status === 'approved' && $faker->boolean(70)) {
                BeneficiaryProgramAssignment::create([
                    'housing_beneficiary_id' => null,
                    'household_id' => $household->id,
                    'housing_program_id' => $faker->randomElement($programs)->id,
                    'assigned_date' => $application->approved_at?->toDateString(),
                    'status' => $faker->randomElement(['pending', 'active']),
                    'notes' => $faker->optional(0.3)->sentence(),
                    'assigned_by' => $users->random()->id,
                ]);
            }
        }
    }

    /**
     * Create status history for an application.
     */
    private function createStatusHistory($application, $users): void
    {
        $statusFlow = ['draft', 'submitted', 'under_review'];
        $currentStatus = $application->status;

        // Determine which statuses to create history for
        $historyStatuses = [];
        foreach ($statusFlow as $status) {
            $historyStatuses[] = $status;
            if ($status === $currentStatus) {
                break;
            }
        }

        // Add final status if approved or rejected
        if (in_array($currentStatus, ['approved', 'rejected'])) {
            $historyStatuses[] = $currentStatus;
        }

        $previousStatus = null;
        foreach ($historyStatuses as $index => $status) {
            $changedBy = $users->random()->id;
            $changedAt = $application->created_at->copy()->addDays($index);

            if ($status === 'submitted' && $application->submitted_at) {
                $changedAt = $application->submitted_at;
            } elseif ($status === 'under_review' && $application->reviewed_at) {
                $changedAt = $application->reviewed_at;
            } elseif (in_array($status, ['approved', 'rejected']) && $application->approved_at) {
                $changedAt = $application->approved_at;
            }

            HousingBeneficiaryStatusHistory::create([
                'housing_beneficiary_application_id' => $application->id,
                'status_from' => $previousStatus,
                'status_to' => $status,
                'changed_by' => $changedBy,
                'notes' => $index > 0 ? 'Status updated by system seeder.' : null,
                'created_at' => $changedAt,
            ]);

            $previousStatus = $status;
        }
    }
}
