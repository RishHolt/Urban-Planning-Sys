<?php

namespace Database\Factories;

use App\Models\Inspection;
use App\Models\ZoningApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inspection>
 */
class InspectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'completed', 'reviewed']);
        $result = $status === 'pending' 
            ? 'pending'
            : $this->faker->randomElement(['passed', 'failed']);

        return [
            'application_id' => ZoningApplication::factory(),
            'inspector_id' => User::factory()->state(['role' => 'staff']),
            'scheduled_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'findings' => $this->faker->optional(0.7)->paragraph(),
            'result' => $result,
            'inspected_at' => $status !== 'pending' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'recommendations' => $this->faker->optional(0.5)->paragraph(),
            'inspection_status' => $status,
            'completed_at' => $status !== 'pending' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'reviewed_at' => $status === 'reviewed' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'reviewed_by' => $status === 'reviewed' ? User::factory()->state(['role' => 'admin']) : null,
            'review_notes' => $status === 'reviewed' ? $this->faker->sentence() : null,
        ];
    }
}
