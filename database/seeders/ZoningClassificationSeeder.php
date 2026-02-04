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
        $classifications = $this->getClassifications();

        foreach ($classifications as $classification) {
            ZoningClassification::updateOrCreate(
                ['code' => $classification['code']],
                $classification
            );
        }
    }

    /**
     * Get all zoning classifications to seed.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getClassifications(): array
    {
        return [
            ...$this->getResidentialClassifications(),
            ...$this->getCommercialClassifications(),
            ...$this->getIndustrialClassifications(),
            ...$this->getInstitutionalClassifications(),
            ...$this->getSpecialClassifications(),
        ];
    }

    /**
     * Get residential zoning classifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getResidentialClassifications(): array
    {
        return [
            [
                'code' => 'R-1',
                'name' => 'Low Density Residential',
                'description' => 'Single-family and two-family residential dwellings with low population density.',
                'allowed_uses' => 'Detached dwellings, semi-detached dwellings, home occupations, accessory structures.',
                'color' => '#FFFF00', // Yellow
                'is_active' => true,
            ],
            [
                'code' => 'R-2',
                'name' => 'Medium Density Residential',
                'description' => 'Multi-family residential dwellings with medium population density.',
                'allowed_uses' => 'Apartments, townhouses, condominiums, duplexes, boarding houses.',
                'color' => '#FFA500', // Orange
                'is_active' => true,
            ],
            [
                'code' => 'R-3',
                'name' => 'High Density Residential',
                'description' => 'High-density residential developments including multi-story buildings.',
                'allowed_uses' => 'High-rise apartments, condominiums, residential complexes, dormitories.',
                'color' => '#FF6347', // Tomato Red
                'is_active' => true,
            ],
        ];
    }

    /**
     * Get commercial zoning classifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getCommercialClassifications(): array
    {
        return [
            [
                'code' => 'C-1',
                'name' => 'General Commercial',
                'description' => 'Neighborhood-scale commercial and service activities.',
                'allowed_uses' => 'Retail stores, banks, offices, restaurants, personal services, convenience stores.',
                'color' => '#FF0000', // Red
                'is_active' => true,
            ],
            [
                'code' => 'C-2',
                'name' => 'Central Business District',
                'description' => 'Central business district with intensive commercial activities.',
                'allowed_uses' => 'Shopping centers, department stores, hotels, entertainment venues, offices.',
                'color' => '#DC143C', // Crimson
                'is_active' => true,
            ],
            [
                'code' => 'C-3',
                'name' => 'Commercial/Residential Mixed Use',
                'description' => 'Mixed-use development combining commercial and residential uses.',
                'allowed_uses' => 'Commercial establishments on ground floor, residential units on upper floors.',
                'color' => '#FF1493', // Deep Pink
                'is_active' => true,
            ],
        ];
    }

    /**
     * Get industrial zoning classifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getIndustrialClassifications(): array
    {
        return [
            [
                'code' => 'I-1',
                'name' => 'Light Industrial',
                'description' => 'Non-pollutive and non-hazardous light industries.',
                'allowed_uses' => 'Manufacturing, assembly, warehousing, repair shops, research facilities.',
                'color' => '#800080', // Purple
                'is_active' => true,
            ],
            [
                'code' => 'I-2',
                'name' => 'Heavy Industrial',
                'description' => 'Heavy industries with potential environmental impacts.',
                'allowed_uses' => 'Heavy manufacturing, processing plants, storage facilities, industrial complexes.',
                'color' => '#4B0082', // Indigo
                'is_active' => true,
            ],
        ];
    }

    /**
     * Get institutional zoning classifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getInstitutionalClassifications(): array
    {
        return [
            [
                'code' => 'INST',
                'name' => 'Institutional',
                'description' => 'Public and private institutions serving the community.',
                'allowed_uses' => 'Schools, hospitals, government offices, churches, community centers, libraries.',
                'color' => '#0000FF', // Blue
                'is_active' => true,
            ],
        ];
    }

    /**
     * Get special purpose zoning classifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getSpecialClassifications(): array
    {
        return [
            [
                'code' => 'OS',
                'name' => 'Open Space/Parks',
                'description' => 'Parks, playgrounds, and recreational areas for public use.',
                'allowed_uses' => 'Public parks, sports fields, nature preserves, playgrounds, recreational facilities.',
                'color' => '#008000', // Green
                'is_active' => true,
            ],
            [
                'code' => 'AGRI',
                'name' => 'Agricultural',
                'description' => 'Areas designated for cultivation of crops and livestock raising.',
                'allowed_uses' => 'Farming, orchards, animal husbandry, agricultural processing, farm structures.',
                'color' => '#ADFF2F', // Green Yellow
                'is_active' => true,
            ],
            [
                'code' => 'UTIL',
                'name' => 'Utilities',
                'description' => 'Areas designated for utility infrastructure and facilities.',
                'allowed_uses' => 'Power plants, water treatment facilities, telecommunications towers, utility substations.',
                'color' => '#808080', // Gray
                'is_active' => true,
            ],
        ];
    }
}
