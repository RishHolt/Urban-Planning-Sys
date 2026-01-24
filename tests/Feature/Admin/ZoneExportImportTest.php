<?php

use App\Models\User;
use App\Models\Zone;
use App\Models\ZoningClassification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    
    $this->classification = ZoningClassification::create([
        'code' => 'R-1',
        'name' => 'Residential 1',
        'color' => '#FF0000',
        'is_active' => true,
    ]);

    $this->zone = Zone::create([
        'zoning_classification_id' => $this->classification->id,
        'label' => 'Zone A',
        'geometry' => [
            'type' => 'Polygon', 
            'coordinates' => [[[0,0],[0,1],[1,1],[1,0],[0,0]]]
        ],
        'is_active' => true,
    ]);
});

test('admin can export zones to geojson', function () {
    $response = $this->actingAs($this->user)
        ->getJson(route('admin.zoning.zones.export'));

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/geo+json');
    
    $data = $response->json();
    expect($data['type'])->toBe('FeatureCollection');
    expect($data['features'])->toHaveCount(1);
    expect($data['features'][0]['properties']['label'])->toBe('Zone A');
    expect($data['features'][0]['properties']['classification_code'])->toBe('R-1');
});

test('admin can import zones from geojson', function () {
    $geoJson = [
        'type' => 'FeatureCollection',
        'features' => [
            [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [[[0,0],[0,2],[2,2],[2,0],[0,0]]]
                ],
                'properties' => [
                    'label' => 'Imported Zone',
                    'classification_code' => 'C-1',
                    'classification_name' => 'Commercial 1',
                    'color' => '#00FF00',
                    'is_active' => true,
                ],
            ]
        ],
    ];

    $file = UploadedFile::fake()->createWithContent('test.geojson', json_encode($geoJson));

    $response = $this->actingAs($this->user)
        ->postJson(route('admin.zoning.zones.import'), [
            'file' => $file,
        ]);

    $response->assertStatus(200);
    $response->assertJsonFragment(['success' => true]);

    $this->assertDatabaseHas('zoning_classifications', [
        'code' => 'C-1',
        'name' => 'Commercial 1',
    ], 'zcs_db');

    $this->assertDatabaseHas('zones', [
        'label' => 'Imported Zone',
    ], 'zcs_db');
});
