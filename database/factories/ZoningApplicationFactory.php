<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ZoningApplication>
 */
class ZoningApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $applicantType = fake()->randomElement(['individual', 'company']);
        $isPropertyOwner = fake()->boolean(60);
        $landType = fake()->randomElement(['residential', 'commercial', 'industrial', 'agricultural', 'mixed-use']);
        $applicationType = fake()->randomElement(['new_classification', 'reclassification']);
        $status = fake()->randomElement(['pending', 'under_review', 'approved', 'rejected']);

        return [
            'user_id' => fake()->uuid(),
            'application_number' => 'ZON-' . date('Y') . '-' . fake()->unique()->numberBetween(1000, 9999),
            'service_id' => fake()->uuid(),
            'status' => $status,
            'submitted_at' => fake()->dateTimeBetween('-3 months', 'now'),
            
            // Applicant Information
            'applicant_type' => $applicantType,
            'applicant_name' => $applicantType === 'company' ? null : fake()->name(),
            'applicant_email' => fake()->safeEmail(),
            'applicant_contact' => fake()->phoneNumber(),
            'valid_id_path' => 'documents/valid-ids/' . fake()->uuid() . '.pdf',
            
            // Company Information (if applicable)
            'company_name' => $applicantType === 'company' ? fake()->company() : null,
            'sec_dti_reg_no' => $applicantType === 'company' ? fake()->regexify('[A-Z0-9]{10,15}') : null,
            'authorized_representative' => $applicantType === 'company' ? fake()->name() : null,
            
            // Property Owner Information
            'is_property_owner' => $isPropertyOwner,
            'owner_name' => $isPropertyOwner ? null : fake()->name(),
            'owner_address' => $isPropertyOwner ? null : fake()->address(),
            'owner_contact' => $isPropertyOwner ? null : fake()->phoneNumber(),
            
            // Location Details
            'province' => 'Bulacan',
            'municipality' => fake()->randomElement(['San Jose del Monte', 'Meycauayan', 'Malolos', 'Marilao', 'Bocaue']),
            'barangay' => fake()->randomElement(['San Martin', 'Santo Cristo', 'Tungkong Mangga', 'Gumaoc Central', 'Poblacion']),
            'lot_no' => fake()->numberBetween(1, 999),
            'block_no' => fake()->numberBetween(1, 50),
            'street_name' => fake()->streetName(),
            'latitude' => fake()->latitude(14.5, 15.0),
            'longitude' => fake()->longitude(120.8, 121.2),
            
            // Land Information
            'land_type' => $landType,
            'has_existing_structure' => fake()->boolean(70),
            'number_of_buildings' => fake()->numberBetween(0, 5),
            'lot_area' => fake()->randomFloat(2, 100, 10000),
            
            // Application Details
            'application_type' => $applicationType,
            'proposed_use' => fake()->randomElement([
                'Residential Subdivision',
                'Commercial Building',
                'Mixed-Use Development',
                'Industrial Warehouse',
                'Agricultural Processing Plant'
            ]),
            'project_description' => fake()->paragraph(3),
            'previous_use' => $applicationType === 'reclassification' ? fake()->sentence() : null,
            'justification' => $applicationType === 'reclassification' ? fake()->paragraph(2) : null,
            
            // Legal Declarations
            'declaration_truthfulness' => true,
            'agreement_compliance' => true,
            'data_privacy_consent' => true,
            'application_date' => fake()->dateTimeBetween('-3 months', 'now'),
            
            // Processing Information
            'notes' => fake()->optional(0.3)->paragraph(),
            'rejection_reason' => $status === 'rejected' ? fake()->sentence() : null,
            'reviewed_by' => in_array($status, ['approved', 'rejected', 'under_review']) ? fake()->uuid() : null,
            'reviewed_at' => in_array($status, ['approved', 'rejected', 'under_review']) ? fake()->dateTimeBetween('-2 months', 'now') : null,
            'approved_by' => $status === 'approved' ? fake()->uuid() : null,
            'approved_at' => $status === 'approved' ? fake()->dateTimeBetween('-1 month', 'now') : null,
        ];
    }
}
