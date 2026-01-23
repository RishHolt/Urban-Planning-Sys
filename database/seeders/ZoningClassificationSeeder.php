<?php

namespace Database\Seeders;

use App\Models\ZoningClassification;
use Illuminate\Database\Seeder;

class ZoningClassificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classifications = [
            [
                'code' => 'R-1',
                'name' => 'Low Density Residential',
                'description' => 'Single-family and two-family residential dwellings.',
                'allowed_uses' => 'Detached dwellings, semi-detached dwellings, home occupations.',
                'color' => '#FFFF00', // Yellow
                'is_active' => true,
            ],
            [
                'code' => 'R-2',
                'name' => 'Medium Density Residential',
                'description' => 'Multi-family residential dwellings, medium density.',
                'allowed_uses' => 'Apartments, townhouses, condominiums.',
                'color' => '#FFA500', // Orange
                'is_active' => true,
            ],
            [
                'code' => 'C-1',
                'name' => 'General Commercial',
                'description' => 'Neighborhood-scale commercial and service activities.',
                'allowed_uses' => 'Retail stores, banks, offices, restaurants.',
                'color' => '#FF0000', // Red
                'is_active' => true,
            ],
            [
                'code' => 'I-1',
                'name' => 'Light Industrial',
                'description' => 'Non-pollutive/non-hazardous industries.',
                'allowed_uses' => 'Manufacturing, warehousing, repair shops.',
                'color' => '#800080', // Purple
                'is_active' => true,
            ],
            [
                'code' => 'INST',
                'name' => 'Institutional',
                'description' => 'Public and private institutions.',
                'allowed_uses' => 'Schools, hospitals, government offices, churches.',
                'color' => '#0000FF', // Blue
                'is_active' => true,
            ],
            [
                'code' => 'OS',
                'name' => 'Open Space/Parks',
                'description' => 'Parks, playgrounds, and recreational areas.',
                'allowed_uses' => 'Public parks, sports fields, nature preserves.',
                'color' => '#008000', // Green
                'is_active' => true,
            ],
            [
                'code' => 'AGRI',
                'name' => 'Agricultural',
                'description' => 'Cultivation of crops and livestock raising.',
                'allowed_uses' => 'Farming, orchards, animal husbandry.',
                'color' => '#ADFF2F', // Green Yellow
                'is_active' => true,
            ],
        ];

        foreach ($classifications as $classification) {
            ZoningClassification::updateOrCreate(
                ['code' => $classification['code']],
                $classification
            );
        }
    }
}
