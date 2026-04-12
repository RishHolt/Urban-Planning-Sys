<?php

namespace Database\Seeders;

use App\Models\ComplianceRule;
use Illuminate\Database\Seeder;

class ComplianceRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            'R1' => [
                'name' => 'Residential Zone 1',
                'allowed_uses' => ['residential'],
                'front_setback' => 5.0,
                'rear_setback' => 3.0,
                'side_setback' => 2.0,
                'floor_area_ratio' => 0.5,
                'max_height' => 10.0,
                'max_storeys' => 3,
                'open_space_requirement' => 0.3,
                'min_lot_area' => 150.0,
            ],
            'R2' => [
                'name' => 'Residential Zone 2',
                'allowed_uses' => ['residential'],
                'front_setback' => 4.0,
                'rear_setback' => 2.5,
                'side_setback' => 1.5,
                'floor_area_ratio' => 0.6,
                'max_height' => 12.0,
                'max_storeys' => 4,
                'open_space_requirement' => 0.25,
                'min_lot_area' => 100.0,
            ],
            'R3' => [
                'name' => 'Residential Zone 3',
                'allowed_uses' => ['residential', 'mixed_use'],
                'front_setback' => 3.0,
                'rear_setback' => 2.0,
                'side_setback' => 1.0,
                'floor_area_ratio' => 0.7,
                'max_height' => 15.0,
                'max_storeys' => 5,
                'open_space_requirement' => 0.2,
                'min_lot_area' => 80.0,
            ],
            'R4' => [
                'name' => 'Residential Zone 4',
                'allowed_uses' => ['residential', 'mixed_use'],
                'front_setback' => 2.0,
                'rear_setback' => 1.5,
                'side_setback' => 0.5,
                'floor_area_ratio' => 0.8,
                'max_height' => 18.0,
                'max_storeys' => 6,
                'open_space_requirement' => 0.15,
                'min_lot_area' => 60.0,
            ],
            'C1' => [
                'name' => 'Commercial Zone 1',
                'allowed_uses' => ['commercial', 'mixed_use'],
                'front_setback' => 3.0,
                'rear_setback' => 2.0,
                'side_setback' => 1.5,
                'floor_area_ratio' => 1.0,
                'max_height' => 20.0,
                'max_storeys' => 6,
                'open_space_requirement' => 0.1,
                'min_lot_area' => 100.0,
            ],
            'C2' => [
                'name' => 'Commercial Zone 2',
                'allowed_uses' => ['commercial', 'mixed_use'],
                'front_setback' => 2.0,
                'rear_setback' => 1.5,
                'side_setback' => 1.0,
                'floor_area_ratio' => 1.5,
                'max_height' => 30.0,
                'max_storeys' => 10,
                'open_space_requirement' => 0.05,
                'min_lot_area' => 80.0,
            ],
            'C3' => [
                'name' => 'Commercial Zone 3',
                'allowed_uses' => ['commercial', 'mixed_use'],
                'front_setback' => 1.5,
                'rear_setback' => 1.0,
                'side_setback' => 0.5,
                'floor_area_ratio' => 2.0,
                'max_height' => 45.0,
                'max_storeys' => 15,
                'open_space_requirement' => 0.05,
                'min_lot_area' => 60.0,
            ],
            'I1' => [
                'name' => 'Industrial Zone 1',
                'allowed_uses' => ['industrial'],
                'front_setback' => 5.0,
                'rear_setback' => 5.0,
                'side_setback' => 3.0,
                'floor_area_ratio' => 1.0,
                'max_height' => 20.0,
                'max_storeys' => 4,
                'open_space_requirement' => 0.2,
                'min_lot_area' => 500.0,
            ],
            'I2' => [
                'name' => 'Industrial Zone 2',
                'allowed_uses' => ['industrial'],
                'front_setback' => 10.0,
                'rear_setback' => 10.0,
                'side_setback' => 5.0,
                'floor_area_ratio' => 0.8,
                'max_height' => 15.0,
                'max_storeys' => 3,
                'open_space_requirement' => 0.3,
                'min_lot_area' => 1000.0,
            ],
            'A1' => [
                'name' => 'Agricultural Zone 1',
                'allowed_uses' => ['agricultural'],
                'front_setback' => 10.0,
                'rear_setback' => 10.0,
                'side_setback' => 5.0,
                'floor_area_ratio' => 0.1,
                'max_height' => 8.0,
                'max_storeys' => 2,
                'open_space_requirement' => 0.8,
                'min_lot_area' => 1000.0,
            ],
            'A2' => [
                'name' => 'Agricultural Zone 2',
                'allowed_uses' => ['agricultural'],
                'front_setback' => 15.0,
                'rear_setback' => 15.0,
                'side_setback' => 10.0,
                'floor_area_ratio' => 0.05,
                'max_height' => 6.0,
                'max_storeys' => 1,
                'open_space_requirement' => 0.9,
                'min_lot_area' => 5000.0,
            ],
            'INS' => [
                'name' => 'Institutional Zone',
                'allowed_uses' => ['institutional'],
                'front_setback' => 5.0,
                'rear_setback' => 5.0,
                'side_setback' => 3.0,
                'floor_area_ratio' => 0.6,
                'max_height' => 15.0,
                'max_storeys' => 5,
                'open_space_requirement' => 0.4,
                'min_lot_area' => 500.0,
            ],
            'MU' => [
                'name' => 'Mixed Use Zone',
                'allowed_uses' => ['mixed_use', 'residential', 'commercial'],
                'front_setback' => 3.0,
                'rear_setback' => 2.0,
                'side_setback' => 1.5,
                'floor_area_ratio' => 1.2,
                'max_height' => 25.0,
                'max_storeys' => 8,
                'open_space_requirement' => 0.15,
                'min_lot_area' => 100.0,
            ],
        ];

        $created = 0;
        $skipped = 0;

        foreach ($rules as $code => $data) {
            $exists = ComplianceRule::where('classification_code', $code)->exists();

            if ($exists) {
                $skipped++;

                continue;
            }

            ComplianceRule::create(array_merge(['classification_code' => $code, 'is_active' => true], $data));
            $created++;
        }

        $this->command->info("ComplianceRuleSeeder: created {$created}, skipped {$skipped} (already existed).");
    }
}
