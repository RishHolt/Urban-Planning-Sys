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
                'description' => 'Primarily used for single-family residential development.',
                'allowed_uses' => 'Single-family houses, duplexes, parks, schools.',
                'color' => '#FFFF00', // Yellow
                'is_active' => true,
            ],
            [
                'code' => 'R-2',
                'name' => 'Medium Density Residential',
                'description' => 'Moderately dense residential buildings like townhouses.',
                'allowed_uses' => 'Townhouses, low-rise apartments, cluster housing.',
                'color' => '#FFFFA8', // Light Yellow
                'is_active' => true,
            ],
            [
                'code' => 'R-3',
                'name' => 'High Density Residential',
                'description' => 'High-rise residential and high-density developments.',
                'allowed_uses' => 'Condominiums, high-rise apartments.',
                'color' => '#FFD700', // Gold
                'is_active' => true,
            ],
            [
                'code' => 'C-1',
                'name' => 'Neighborhood Commercial',
                'description' => 'Small-scale commercial activities serving the neighborhood.',
                'allowed_uses' => 'Retail stores, pharmacies, neighborhood cafes.',
                'color' => '#FF0000', // Red
                'is_active' => true,
            ],
            [
                'code' => 'C-2',
                'name' => 'General Commercial',
                'description' => 'Regional-scale commercial activities and business centers.',
                'allowed_uses' => 'Malls, office buildings, hotels.',
                'color' => '#A52A2A', // Brown
                'is_active' => true,
            ],
            [
                'code' => 'I-1',
                'name' => 'Light Industrial',
                'description' => 'Non-pollutive and non-hazardous light industrial activities.',
                'allowed_uses' => 'Light manufacturing, assembly plants, warehouses.',
                'color' => '#800080', // Purple
                'is_active' => true,
            ],
            [
                'code' => 'I-2',
                'name' => 'Medium Industrial',
                'description' => 'Medium-scale industrial activities.',
                'allowed_uses' => 'Factories, larger manufacturing units.',
                'color' => '#4B0082', // Indigo
                'is_active' => true,
            ],
            [
                'code' => 'INST',
                'name' => 'Institutional',
                'description' => 'Government offices, public buildings, and utilities.',
                'allowed_uses' => 'Govt offices, hospitals, schools, churches.',
                'color' => '#0000FF', // Blue
                'is_active' => true,
            ],
            [
                'code' => 'OS',
                'name' => 'Open Space / Parks',
                'description' => 'Parks, playgrounds, and recreational areas.',
                'allowed_uses' => 'Public parks, sports fields, greenery.',
                'color' => '#008000', // Green
                'is_active' => true,
            ],
            [
                'code' => 'UTL',
                'name' => 'Utilities',
                'description' => 'Infrastructure and utility installations.',
                'allowed_uses' => 'Power plants, water treatment facilities, substations.',
                'color' => '#808080', // Gray
                'is_active' => true,
            ],
            [
                'code' => 'R-SH',
                'name' => 'Socialized Housing',
                'description' => 'Areas designated for socialized housing projects for low-income and underprivileged sectors.',
                'allowed_uses' => 'Socialized housing units, resettlement areas, community facilities, livelihood centers.',
                'color' => '#8B4513', // SaddleBrown
                'is_active' => true,
            ],
            [
                'code' => 'PUD',
                'name' => 'Public Unit Development',
                'description' => 'Areas designed for a mix of residential, commercial, and institutional uses within a single integrated community or public housing project.',
                'allowed_uses' => 'Mixed-use buildings, integrated public facilities, mass housing, residential blocks.',
                'color' => '#FF8C00', // Dark Orange
                'is_active' => true,
            ],
            [
                'code' => 'CEM',
                'name' => 'Cemetery',
                'description' => 'Areas designated for burial grounds and memorial parks.',
                'allowed_uses' => 'Public/private cemeteries, memorial parks, crematoriums, columbariums.',
                'color' => '#A9A9A9', // Dark Gray
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
