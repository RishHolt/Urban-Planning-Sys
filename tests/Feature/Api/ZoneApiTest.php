<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Zone;
use App\Models\ZoningClassification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ZoneApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_retrieve_all_active_zones()
    {
        // 1. Create a user to authenticate
        $user = User::factory()->create();

        // 2. Create Classification
        $classification = ZoningClassification::create([
            'code' => 'R-1',
            'name' => 'Residential 1',
            'description' => 'Low Density Residential',
            'allowed_uses' => 'Housing',
            'color' => '#FF0000',
            'is_active' => true,
        ]);

        // 3. Create Zones
        // Create one active with geometry
        $zone1 = Zone::create([
            'zoning_classification_id' => $classification->id,
            'label' => 'Zone A',
            'geometry' => ['type' => 'Polygon', 'coordinates' => [[[0,0],[0,1],[1,1],[1,0],[0,0]]]],
            'is_active' => true,
        ]);

        // Create one inactive (should not be returned)
        $zone2 = Zone::create([
            'zoning_classification_id' => $classification->id,
            'label' => 'Zone B',
            'geometry' => ['type' => 'Polygon', 'coordinates' => [[[0,0],[0,1],[1,1],[1,0],[0,0]]]],
            'is_active' => false,
        ]);

         // Create one without geometry (should not be returned because of scopeWithGeometry in controller)
         $zone3 = Zone::create([
            'zoning_classification_id' => $classification->id,
            'label' => 'Zone C',
            'geometry' => null,
            'is_active' => true,
        ]);

        // 4. Hit the API
        $response = $this->actingAs($user)
            ->getJson(route('zones.all'));

        // 5. Assertions
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'zones'); // Should only have zone1

        $response->assertJsonFragment([
            'label' => 'Zone A',
            'code' => 'R-1',
        ]);
    }
}
