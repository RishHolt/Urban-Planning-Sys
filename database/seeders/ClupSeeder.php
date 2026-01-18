<?php

namespace Database\Seeders;

use App\Models\ClupMaster;
use App\Models\ZoningClassification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ClupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if table exists before querying
        if (!\Illuminate\Support\Facades\Schema::connection('zcs_db')->hasTable('clup_master')) {
            $this->command->warn('CLUP master table does not exist. Please run migrations first.');
            return;
        }

        // Check if CLUP already exists
        $clup = ClupMaster::where('lgu_name', 'Caloocan City')
            ->where('coverage_start_year', 2016)
            ->where('coverage_end_year', 2025)
            ->first();

        if (!$clup) {
            // Generate unique reference number
            $year = date('Y');
            $lastClup = ClupMaster::whereYear('created_at', $year)->orderBy('clup_id', 'desc')->first();
            $sequence = $lastClup && $lastClup->reference_no 
                ? ((int) substr($lastClup->reference_no, -4)) + 1 
                : 1;
            $referenceNo = sprintf('CLP-%s-%04d', $year, $sequence);

            // Create CLUP Master
            $clup = ClupMaster::create([
                'lgu_name' => 'Caloocan City',
                'reference_no' => $referenceNo,
                'coverage_start_year' => 2016,
                'coverage_end_year' => 2025,
                'approval_date' => '2016-01-15',
                'approving_body' => 'Sangguniang Panlungsod ng Caloocan',
                'resolution_no' => 'SP Res. No. 12-2016',
                'status' => 'Active',
            ]);
        }

        $this->command->info("Creating zoning classifications for CLUP '{$clup->lgu_name}'...");

        // Define zoning classifications
        $classifications = [
            // 1. Residential Zones (R)
            [
                'zoning_code' => 'R-1',
                'zone_name' => 'Low Density Residential',
                'land_use_category' => 'Residential',
                'allowed_uses' => 'Single-detached houses, duplex, churches, small parks',
                'conditional_uses' => 'Small neighborhood store',
                'prohibited_uses' => 'Warehouse, factory, commercial establishments',
            ],
            [
                'zoning_code' => 'R-2',
                'zone_name' => 'Medium Density Residential',
                'land_use_category' => 'Residential',
                'allowed_uses' => 'Townhouses, low-rise apartments, single-detached houses',
                'conditional_uses' => 'Small commercial establishments, clinics',
                'prohibited_uses' => 'Heavy industrial, warehouses, factories',
            ],
            [
                'zoning_code' => 'R-3',
                'zone_name' => 'High Density Residential',
                'land_use_category' => 'Residential',
                'allowed_uses' => 'Condominiums, high-rise apartments, townhouses',
                'conditional_uses' => 'Commercial establishments on ground floor, offices',
                'prohibited_uses' => 'Industrial manufacturing, heavy machinery',
            ],
            [
                'zoning_code' => 'R-4',
                'zone_name' => 'Residential-Commercial',
                'land_use_category' => 'Residential/Commercial',
                'allowed_uses' => 'Residential units, retail stores, offices, restaurants',
                'conditional_uses' => 'Entertainment establishments, hotels',
                'prohibited_uses' => 'Heavy industrial, manufacturing',
            ],
            [
                'zoning_code' => 'BP-220',
                'zone_name' => 'Socialized Housing Zone',
                'land_use_category' => 'Residential',
                'allowed_uses' => 'Socialized housing units, basic community facilities',
                'conditional_uses' => 'Small commercial establishments, schools',
                'prohibited_uses' => 'High-end residential, commercial malls, industrial',
            ],

            // 2. Commercial Zones (C)
            [
                'zoning_code' => 'C-1',
                'zone_name' => 'Neighborhood Commercial',
                'land_use_category' => 'Commercial',
                'allowed_uses' => 'Sari-sari stores, small shops, retail stores, offices',
                'conditional_uses' => 'Food kiosks, small clinics, service shops',
                'prohibited_uses' => 'Industrial manufacturing, warehouses',
            ],
            [
                'zoning_code' => 'C-2',
                'zone_name' => 'General Commercial',
                'land_use_category' => 'Commercial',
                'allowed_uses' => 'Malls, markets, banks, retail stores, restaurants, offices',
                'conditional_uses' => 'Entertainment centers, hotels, parking buildings',
                'prohibited_uses' => 'Industrial manufacturing, heavy machinery',
            ],
            [
                'zoning_code' => 'C-3',
                'zone_name' => 'Central Business District (CBD)',
                'land_use_category' => 'Commercial',
                'allowed_uses' => 'High-rise commercial buildings, offices, retail, hotels, restaurants',
                'conditional_uses' => 'Residential condominiums, entertainment complexes',
                'prohibited_uses' => 'Industrial manufacturing, warehouses',
            ],
            [
                'zoning_code' => 'C-MU',
                'zone_name' => 'Commercial Mixed-Use',
                'land_use_category' => 'Commercial/Residential',
                'allowed_uses' => 'Commercial establishments, residential units, offices',
                'conditional_uses' => 'Entertainment, hotels, parking facilities',
                'prohibited_uses' => 'Heavy industrial, manufacturing',
            ],

            // 3. Industrial Zones (I)
            [
                'zoning_code' => 'I-1',
                'zone_name' => 'Light Industrial',
                'land_use_category' => 'Industrial',
                'allowed_uses' => 'Warehousing, assembly plants, light manufacturing, storage',
                'conditional_uses' => 'Office admin buildings, research facilities',
                'prohibited_uses' => 'High-pollution industry, residential, commercial malls',
            ],
            [
                'zoning_code' => 'I-2',
                'zone_name' => 'Medium Industrial',
                'land_use_category' => 'Industrial',
                'allowed_uses' => 'Processing plants, medium manufacturing, warehouses',
                'conditional_uses' => 'Office buildings, worker housing',
                'prohibited_uses' => 'Residential, commercial, heavy pollution industries',
            ],
            [
                'zoning_code' => 'I-3',
                'zone_name' => 'Heavy Industrial',
                'land_use_category' => 'Industrial',
                'allowed_uses' => 'Refineries, large factories, heavy manufacturing, chemical plants',
                'conditional_uses' => 'Support facilities, worker housing (with restrictions)',
                'prohibited_uses' => 'Residential, commercial, schools, hospitals',
            ],

            // 4. Institutional Zones (INST)
            [
                'zoning_code' => 'INST-GOV',
                'zone_name' => 'Government Centers',
                'land_use_category' => 'Institutional',
                'allowed_uses' => 'Government offices, public facilities, civic centers',
                'conditional_uses' => 'Commercial establishments, parking facilities',
                'prohibited_uses' => 'Industrial, residential (except government housing)',
            ],
            [
                'zoning_code' => 'INST-EDU',
                'zone_name' => 'Schools / Universities',
                'land_use_category' => 'Institutional',
                'allowed_uses' => 'Educational institutions, libraries, research facilities',
                'conditional_uses' => 'Student housing, commercial establishments (canteens, bookstores)',
                'prohibited_uses' => 'Industrial, heavy commercial, entertainment',
            ],
            [
                'zoning_code' => 'INST-HLTH',
                'zone_name' => 'Hospitals / Health Facilities',
                'land_use_category' => 'Institutional',
                'allowed_uses' => 'Hospitals, clinics, medical facilities, health centers',
                'conditional_uses' => 'Pharmacy, medical supply stores, parking',
                'prohibited_uses' => 'Industrial, heavy commercial, entertainment',
            ],
            [
                'zoning_code' => 'INST-REL',
                'zone_name' => 'Religious Institutions',
                'land_use_category' => 'Institutional',
                'allowed_uses' => 'Churches, mosques, temples, religious schools, convents',
                'conditional_uses' => 'Community centers, parking facilities',
                'prohibited_uses' => 'Industrial, heavy commercial, entertainment',
            ],
            [
                'zoning_code' => 'INST-SEC',
                'zone_name' => 'Police / Military Facilities',
                'land_use_category' => 'Institutional',
                'allowed_uses' => 'Police stations, military bases, security facilities, training grounds',
                'conditional_uses' => 'Support facilities, housing for personnel',
                'prohibited_uses' => 'Commercial, residential (except personnel housing), industrial',
            ],

            // 5. Agricultural Zones (AG)
            [
                'zoning_code' => 'AG-PRIME',
                'zone_name' => 'Prime Agricultural Land',
                'land_use_category' => 'Agricultural',
                'allowed_uses' => 'Crop production, farming, agricultural research',
                'conditional_uses' => 'Agricultural processing, storage facilities',
                'prohibited_uses' => 'Residential, commercial, industrial (except agro-industrial)',
            ],
            [
                'zoning_code' => 'AG-CROP',
                'zone_name' => 'Crop Production Area',
                'land_use_category' => 'Agricultural',
                'allowed_uses' => 'Crop farming, agricultural activities, greenhouses',
                'conditional_uses' => 'Agricultural processing, storage, farm equipment',
                'prohibited_uses' => 'Residential, commercial, industrial',
            ],
            [
                'zoning_code' => 'AG-LIVESTOCK',
                'zone_name' => 'Livestock / Poultry Area',
                'land_use_category' => 'Agricultural',
                'allowed_uses' => 'Livestock raising, poultry farms, animal husbandry',
                'conditional_uses' => 'Processing facilities, feed storage',
                'prohibited_uses' => 'Residential, commercial, heavy industrial',
            ],
            [
                'zoning_code' => 'AG-INDUSTRIAL',
                'zone_name' => 'Agro-industrial Zone',
                'land_use_category' => 'Agricultural/Industrial',
                'allowed_uses' => 'Agricultural processing, food manufacturing, storage',
                'conditional_uses' => 'Support facilities, worker housing',
                'prohibited_uses' => 'Heavy industrial, residential, commercial',
            ],

            // 6. Special Purpose Zones (SP)
            [
                'zoning_code' => 'SP-PARK',
                'zone_name' => 'Parks and Open Spaces',
                'land_use_category' => 'Special Purpose',
                'allowed_uses' => 'Parks, playgrounds, open spaces, recreational facilities',
                'conditional_uses' => 'Commercial establishments (kiosks, food stalls), parking',
                'prohibited_uses' => 'Residential, industrial, heavy commercial',
            ],
            [
                'zoning_code' => 'SP-CEMETERY',
                'zone_name' => 'Cemeteries / Memorial Parks',
                'land_use_category' => 'Special Purpose',
                'allowed_uses' => 'Cemeteries, memorial parks, crematoriums',
                'conditional_uses' => 'Floral shops, funeral services, parking',
                'prohibited_uses' => 'Residential, commercial, industrial',
            ],
            [
                'zoning_code' => 'SP-UTILITY',
                'zone_name' => 'Utility Zones',
                'land_use_category' => 'Special Purpose',
                'allowed_uses' => 'Water facilities, power plants, landfill, waste management',
                'conditional_uses' => 'Support facilities, maintenance buildings',
                'prohibited_uses' => 'Residential, commercial, industrial',
            ],
            [
                'zoning_code' => 'SP-TOURISM',
                'zone_name' => 'Tourism Zone',
                'land_use_category' => 'Special Purpose',
                'allowed_uses' => 'Tourist facilities, hotels, resorts, recreational areas',
                'conditional_uses' => 'Commercial establishments, residential (for tourism)',
                'prohibited_uses' => 'Industrial, heavy manufacturing',
            ],
            [
                'zoning_code' => 'SP-TRANSPORT',
                'zone_name' => 'Transportation Zone',
                'land_use_category' => 'Special Purpose',
                'allowed_uses' => 'Ports, terminals, transportation facilities, parking',
                'conditional_uses' => 'Commercial establishments, offices',
                'prohibited_uses' => 'Residential, industrial',
            ],

            // 7. Mixed-Use Zones (MU)
            [
                'zoning_code' => 'MU-RC',
                'zone_name' => 'Residential-Commercial',
                'land_use_category' => 'Mixed-Use',
                'allowed_uses' => 'Residential units, retail stores, offices, restaurants',
                'conditional_uses' => 'Entertainment, hotels, parking facilities',
                'prohibited_uses' => 'Heavy industrial, manufacturing',
            ],
            [
                'zoning_code' => 'MU-CI',
                'zone_name' => 'Commercial-Institutional',
                'land_use_category' => 'Mixed-Use',
                'allowed_uses' => 'Commercial establishments, institutional facilities, offices',
                'conditional_uses' => 'Residential (for institutional staff), parking',
                'prohibited_uses' => 'Heavy industrial, manufacturing',
            ],
            [
                'zoning_code' => 'MU-RO',
                'zone_name' => 'Residential-Office',
                'land_use_category' => 'Mixed-Use',
                'allowed_uses' => 'Residential units, office buildings, professional services',
                'conditional_uses' => 'Commercial establishments, parking',
                'prohibited_uses' => 'Industrial, heavy commercial, manufacturing',
            ],

            // 8. Forest & Protection Zones (F / PZ)
            [
                'zoning_code' => 'F-FOREST',
                'zone_name' => 'Forestland',
                'land_use_category' => 'Forest/Protection',
                'allowed_uses' => 'Forest conservation, reforestation, eco-tourism (limited)',
                'conditional_uses' => 'Research facilities, eco-tourism facilities',
                'prohibited_uses' => 'Residential, commercial, industrial, agriculture',
            ],
            [
                'zoning_code' => 'PZ-WATERSHED',
                'zone_name' => 'Watershed Areas',
                'land_use_category' => 'Protection',
                'allowed_uses' => 'Watershed protection, forest conservation, water source protection',
                'conditional_uses' => 'Research facilities, eco-tourism (very limited)',
                'prohibited_uses' => 'Residential, commercial, industrial, agriculture',
            ],
            [
                'zoning_code' => 'PZ-MANGROVE',
                'zone_name' => 'Mangroves',
                'land_use_category' => 'Protection',
                'allowed_uses' => 'Mangrove conservation, marine protection, eco-tourism (limited)',
                'conditional_uses' => 'Research facilities, educational facilities',
                'prohibited_uses' => 'Residential, commercial, industrial, agriculture',
            ],
            [
                'zoning_code' => 'PZ-RIVER',
                'zone_name' => 'River Easements',
                'land_use_category' => 'Protection',
                'allowed_uses' => 'River protection, flood control, open space',
                'conditional_uses' => 'Recreational facilities, parks',
                'prohibited_uses' => 'Residential, commercial, industrial, permanent structures',
            ],
            [
                'zoning_code' => 'PZ-COASTAL',
                'zone_name' => 'Coastal Protection Zone',
                'land_use_category' => 'Protection',
                'allowed_uses' => 'Coastal protection, marine conservation, open space',
                'conditional_uses' => 'Recreational facilities, eco-tourism (limited)',
                'prohibited_uses' => 'Residential, commercial, industrial, permanent structures',
            ],

            // 9. Planned Unit Development (PUD)
            [
                'zoning_code' => 'PUD-ESTATE',
                'zone_name' => 'Large Estates',
                'land_use_category' => 'Planned Unit Development',
                'allowed_uses' => 'Master-planned residential, commercial, institutional mix',
                'conditional_uses' => 'Entertainment, hotels, recreational facilities',
                'prohibited_uses' => 'Heavy industrial, manufacturing',
            ],
            [
                'zoning_code' => 'PUD-ECOZONE',
                'zone_name' => 'Ecozones',
                'land_use_category' => 'Planned Unit Development',
                'allowed_uses' => 'Industrial, commercial, residential mix, export processing',
                'conditional_uses' => 'Support facilities, worker housing',
                'prohibited_uses' => 'Heavy pollution industries',
            ],
            [
                'zoning_code' => 'PUD-TOWNSHIP',
                'zone_name' => 'Township Developments',
                'land_use_category' => 'Planned Unit Development',
                'allowed_uses' => 'Mixed-use development: residential, commercial, institutional',
                'conditional_uses' => 'Entertainment, hotels, recreational facilities',
                'prohibited_uses' => 'Heavy industrial, manufacturing',
            ],

            // 10. Infrastructure & Utilities Zone (INF)
            [
                'zoning_code' => 'INF-ROAD',
                'zone_name' => 'Roads / Right of Way',
                'land_use_category' => 'Infrastructure',
                'allowed_uses' => 'Roads, highways, bridges, transportation infrastructure',
                'conditional_uses' => 'Parking, commercial (with restrictions)',
                'prohibited_uses' => 'Residential, industrial, permanent structures',
            ],
            [
                'zoning_code' => 'INF-RAIL',
                'zone_name' => 'Railways',
                'land_use_category' => 'Infrastructure',
                'allowed_uses' => 'Railway tracks, stations, rail infrastructure',
                'conditional_uses' => 'Commercial establishments (stations), parking',
                'prohibited_uses' => 'Residential, industrial, permanent structures',
            ],
            [
                'zoning_code' => 'INF-AIRPORT',
                'zone_name' => 'Airports',
                'land_use_category' => 'Infrastructure',
                'allowed_uses' => 'Airport facilities, runways, terminals, aviation infrastructure',
                'conditional_uses' => 'Commercial establishments, hotels, parking',
                'prohibited_uses' => 'Residential, industrial (except aviation-related)',
            ],
            [
                'zoning_code' => 'INF-POWER',
                'zone_name' => 'Power Plants',
                'land_use_category' => 'Infrastructure',
                'allowed_uses' => 'Power generation facilities, substations, power infrastructure',
                'conditional_uses' => 'Support facilities, worker housing',
                'prohibited_uses' => 'Residential, commercial, other industrial',
            ],
            [
                'zoning_code' => 'INF-WATER',
                'zone_name' => 'Water Facilities',
                'land_use_category' => 'Infrastructure',
                'allowed_uses' => 'Water treatment plants, reservoirs, water infrastructure',
                'conditional_uses' => 'Support facilities, maintenance buildings',
                'prohibited_uses' => 'Residential, commercial, industrial',
            ],
        ];

        // Check if all classifications already exist
        $existingClassifications = ZoningClassification::where('clup_id', $clup->clup_id)->count();
        $totalClassifications = count($classifications);
        
        if ($existingClassifications >= $totalClassifications) {
            $this->command->info("CLUP '{$clup->lgu_name}' with all {$totalClassifications} classifications already exists. Skipping...");
            return;
        }
        
        // Get existing codes to skip
        $existingCodes = [];
        if ($existingClassifications > 0) {
            $this->command->info("CLUP '{$clup->lgu_name}' has {$existingClassifications} classifications. Creating missing classifications...");
            $existingCodes = ZoningClassification::where('clup_id', $clup->clup_id)
                ->pluck('zoning_code')
                ->toArray();
        }

        // Create zoning classifications (skip existing ones)
        $count = 0;
        foreach ($classifications as $classification) {
            // Skip if this classification already exists
            if (in_array($classification['zoning_code'], $existingCodes)) {
                continue;
            }
            
            ZoningClassification::create([
                'clup_id' => $clup->clup_id,
                'zoning_code' => $classification['zoning_code'],
                'zone_name' => $classification['zone_name'],
                'land_use_category' => $classification['land_use_category'],
                'allowed_uses' => $classification['allowed_uses'],
                'conditional_uses' => $classification['conditional_uses'],
                'prohibited_uses' => $classification['prohibited_uses'],
            ]);
            $count++;
        }

        $this->command->info("Successfully created {$count} zoning classifications for CLUP '{$clup->lgu_name}'.");
    }
}
