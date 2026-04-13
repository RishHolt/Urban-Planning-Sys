<?php

namespace Database\Factories;

use App\Models\ZoningApplication;
use App\Models\User;
use App\Models\Zone;
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
        $status = fake()->randomElement(['pending', 'under_review', 'for_inspection', 'for_approval', 'approved', 'rejected']);

        return [
            'application_number' => 'ZON-' . date('Y') . '-' . fake()->unique()->numberBetween(1000, 9999),
            'reference_no' => 'ZC-' . date('Y-m') . '-' . fake()->unique()->numberBetween(1000, 9999),
            'service_id' => fake()->uuid(),
            'user_id' => User::factory(),
            'zone_id' => null, // Will be set or left null
            'applicant_type' => $applicantType,
            'is_representative' => fake()->boolean(20),
            'representative_name' => fake()->name(),
            'applicant_name' => fake()->name(),
            'applicant_email' => fake()->safeEmail(),
            'applicant_contact' => fake()->phoneNumber(),
            'contact_number' => fake()->phoneNumber(),
            'contact_email' => fake()->safeEmail(),
            'valid_id_path' => 'documents/valid-ids/' . fake()->uuid() . '.pdf',
            'tax_dec_ref_no' => fake()->numerify('TAX-####-####'),
            'barangay_permit_ref_no' => fake()->numerify('BP-####-####'),
            'pin_lat' => fake()->latitude(14.64, 14.76),
            'pin_lng' => fake()->longitude(120.97, 121.07),
            'lot_address' => fake()->address(),
            'province' => 'Metro Manila',
            'municipality' => 'Caloocan City',
            'barangay' => fake()->randomElement(['Barangay 171', 'Barangay 178', 'Barangay 8', 'Barangay 12', 'Bagong Silang']),
            'street_name' => fake()->streetName(),
            'lot_owner' => fake()->name(),
            'tct_no' => fake()->numerify('TCT-####-####'),
            'lot_owner_contact_number' => fake()->phoneNumber(),
            'lot_owner_contact_email' => fake()->safeEmail(),
            'lot_area_total' => fake()->randomFloat(2, 100, 5000),
            'lot_area_used' => fake()->randomFloat(2, 50, 4000),
            'is_subdivision' => fake()->boolean(10),
            'subdivision_name' => fake()->optional(0.1)->company(),
            'block_no' => fake()->numberBetween(1, 100),
            'lot_no' => fake()->numberBetween(1, 100),
            'total_lots_planned' => 0,
            'has_subdivision_plan' => false,
            'land_use_type' => fake()->randomElement(['Residential', 'Commercial', 'Industrial']),
            'project_type' => fake()->randomElement(['New Construction', 'Renovation']),
            'building_type' => fake()->randomElement(['Single Detached', 'Duplex', 'Commercial Building']),
            'project_description' => fake()->paragraph(),
            'number_of_storeys' => fake()->numberBetween(1, 5),
            'floor_area_sqm' => fake()->randomFloat(2, 50, 1000),
            'building_footprint_sqm' => fake()->randomFloat(2, 40, 800),
            'front_setback_m' => fake()->randomFloat(2, 2, 5),
            'rear_setback_m' => fake()->randomFloat(2, 2, 5),
            'side_setback_left_m' => fake()->randomFloat(2, 1.5, 3),
            'side_setback_right_m' => fake()->randomFloat(2, 1.5, 3),
            'number_of_units' => fake()->numberBetween(1, 10),
            'purpose' => fake()->sentence(),
            'project_cost' => fake()->randomFloat(2, 100000, 10000000),
            'assessed_fee' => fake()->randomFloat(2, 500, 5000),
            'status' => $status,
            'is_active' => true,
            'submitted_at' => fake()->dateTimeBetween('-3 months', 'now'),
            'processed_at' => in_array($status, ['approved', 'rejected']) ? fake()->dateTimeBetween('-1 month', 'now') : null,
            'application_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'notes' => fake()->optional(0.3)->sentence(),
            'rejection_reason' => $status === 'rejected' ? fake()->sentence() : null,
            'reviewed_by' => in_array($status, ['approved', 'rejected', 'under_review']) ? User::factory()->state(['role' => 'staff']) : null,
            'reviewed_at' => in_array($status, ['approved', 'rejected', 'under_review']) ? fake()->dateTimeBetween('-2 months', 'now') : null,
            'approved_by' => $status === 'approved' ? User::factory()->state(['role' => 'admin']) : null,
            'approved_at' => $status === 'approved' ? fake()->dateTimeBetween('-1 month', 'now') : null,
        ];
    }
}
