<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Zoning Compliance Rules
    |--------------------------------------------------------------------------
    |
    | This file contains compliance rules for different zoning classifications.
    | Rules are organized by classification code (e.g., R1, R2, C1, etc.)
    |
    */

    'rules' => [
        // Residential Zones
        'R1' => [
            'name' => 'Residential Zone 1',
            'allowed_uses' => ['residential'],
            'setbacks' => [
                'front' => 5.0, // meters
                'rear' => 3.0,
                'side' => 2.0,
            ],
            'floor_area_ratio' => 0.5, // FAR limit
            'max_height' => 10.0, // meters
            'max_storeys' => 3,
            'open_space_requirement' => 0.3, // 30% of lot
            'min_lot_area' => 150.0, // sqm
        ],
        'R2' => [
            'name' => 'Residential Zone 2',
            'allowed_uses' => ['residential'],
            'setbacks' => [
                'front' => 4.0,
                'rear' => 2.5,
                'side' => 1.5,
            ],
            'floor_area_ratio' => 0.6,
            'max_height' => 12.0,
            'max_storeys' => 4,
            'open_space_requirement' => 0.25,
            'min_lot_area' => 100.0,
        ],
        'R3' => [
            'name' => 'Residential Zone 3',
            'allowed_uses' => ['residential', 'mixed_use'],
            'setbacks' => [
                'front' => 3.0,
                'rear' => 2.0,
                'side' => 1.0,
            ],
            'floor_area_ratio' => 0.7,
            'max_height' => 15.0,
            'max_storeys' => 5,
            'open_space_requirement' => 0.2,
            'min_lot_area' => 80.0,
        ],
        'R4' => [
            'name' => 'Residential Zone 4',
            'allowed_uses' => ['residential', 'mixed_use'],
            'setbacks' => [
                'front' => 2.0,
                'rear' => 1.5,
                'side' => 0.5,
            ],
            'floor_area_ratio' => 0.8,
            'max_height' => 18.0,
            'max_storeys' => 6,
            'open_space_requirement' => 0.15,
            'min_lot_area' => 60.0,
        ],

        // Commercial Zones
        'C1' => [
            'name' => 'Commercial Zone 1',
            'allowed_uses' => ['commercial', 'mixed_use'],
            'setbacks' => [
                'front' => 3.0,
                'rear' => 2.0,
                'side' => 1.5,
            ],
            'floor_area_ratio' => 1.0,
            'max_height' => 20.0,
            'max_storeys' => 6,
            'open_space_requirement' => 0.1,
            'min_lot_area' => 100.0,
        ],
        'C2' => [
            'name' => 'Commercial Zone 2',
            'allowed_uses' => ['commercial', 'mixed_use'],
            'setbacks' => [
                'front' => 2.0,
                'rear' => 1.5,
                'side' => 1.0,
            ],
            'floor_area_ratio' => 1.5,
            'max_height' => 30.0,
            'max_storeys' => 10,
            'open_space_requirement' => 0.05,
            'min_lot_area' => 80.0,
        ],
        'C3' => [
            'name' => 'Commercial Zone 3',
            'allowed_uses' => ['commercial', 'mixed_use'],
            'setbacks' => [
                'front' => 1.5,
                'rear' => 1.0,
                'side' => 0.5,
            ],
            'floor_area_ratio' => 2.0,
            'max_height' => 45.0,
            'max_storeys' => 15,
            'open_space_requirement' => 0.05,
            'min_lot_area' => 60.0,
        ],

        // Industrial Zones
        'I1' => [
            'name' => 'Industrial Zone 1',
            'allowed_uses' => ['industrial'],
            'setbacks' => [
                'front' => 5.0,
                'rear' => 5.0,
                'side' => 3.0,
            ],
            'floor_area_ratio' => 1.0,
            'max_height' => 20.0,
            'max_storeys' => 4,
            'open_space_requirement' => 0.2,
            'min_lot_area' => 500.0,
        ],
        'I2' => [
            'name' => 'Industrial Zone 2',
            'allowed_uses' => ['industrial'],
            'setbacks' => [
                'front' => 10.0,
                'rear' => 10.0,
                'side' => 5.0,
            ],
            'floor_area_ratio' => 0.8,
            'max_height' => 15.0,
            'max_storeys' => 3,
            'open_space_requirement' => 0.3,
            'min_lot_area' => 1000.0,
        ],

        // Agricultural Zones
        'A1' => [
            'name' => 'Agricultural Zone 1',
            'allowed_uses' => ['agricultural'],
            'setbacks' => [
                'front' => 10.0,
                'rear' => 10.0,
                'side' => 5.0,
            ],
            'floor_area_ratio' => 0.1,
            'max_height' => 8.0,
            'max_storeys' => 2,
            'open_space_requirement' => 0.8,
            'min_lot_area' => 1000.0,
        ],
        'A2' => [
            'name' => 'Agricultural Zone 2',
            'allowed_uses' => ['agricultural'],
            'setbacks' => [
                'front' => 15.0,
                'rear' => 15.0,
                'side' => 10.0,
            ],
            'floor_area_ratio' => 0.05,
            'max_height' => 6.0,
            'max_storeys' => 1,
            'open_space_requirement' => 0.9,
            'min_lot_area' => 5000.0,
        ],

        // Institutional
        'INS' => [
            'name' => 'Institutional Zone',
            'allowed_uses' => ['institutional'],
            'setbacks' => [
                'front' => 5.0,
                'rear' => 5.0,
                'side' => 3.0,
            ],
            'floor_area_ratio' => 0.6,
            'max_height' => 15.0,
            'max_storeys' => 5,
            'open_space_requirement' => 0.4,
            'min_lot_area' => 500.0,
        ],

        // Mixed Use
        'MU' => [
            'name' => 'Mixed Use Zone',
            'allowed_uses' => ['mixed_use', 'residential', 'commercial'],
            'setbacks' => [
                'front' => 3.0,
                'rear' => 2.0,
                'side' => 1.5,
            ],
            'floor_area_ratio' => 1.2,
            'max_height' => 25.0,
            'max_storeys' => 8,
            'open_space_requirement' => 0.15,
            'min_lot_area' => 100.0,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Rules
    |--------------------------------------------------------------------------
    |
    | Rules applied when a specific classification is not found
    |
    */
    'default' => [
        'setbacks' => [
            'front' => 3.0,
            'rear' => 2.0,
            'side' => 1.5,
        ],
        'floor_area_ratio' => 0.6,
        'max_height' => 15.0,
        'max_storeys' => 5,
        'open_space_requirement' => 0.2,
        'min_lot_area' => 100.0,
    ],
];
