<?php

namespace Tests\Unit\Services;

use App\Services\FeeAssessmentService;
use Tests\TestCase;
use App\Models\Zone;
use App\Models\ZoningClassification;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class FeeAssessmentServiceTest extends TestCase
{
    // removed RefreshDatabase

    protected FeeAssessmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Force config for zcs_db
        Config::set('database.connections.zcs_db', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);

        // Create tables manually for the test context
        Schema::connection('zcs_db')->create('zoning_classifications', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('name');
            $table->timestamps();
        });

         Schema::connection('zcs_db')->create('zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zoning_classification_id')->nullable();
            $table->string('label')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_municipality')->default(false);
            $table->json('geometry')->nullable();
            $table->timestamps();
        });

        $this->service = new FeeAssessmentService();
    }

    public function test_calculates_residential_house_fee_r1()
    {
        $classification = ZoningClassification::create(['code' => 'R1', 'name' => 'Residential 1']);
        $zone = Zone::create(['zoning_classification_id' => $classification->id]);

        $data = [
            'zone_id' => $zone->id,
            'project_type' => 'new_construction',
        ];

        $result = $this->service->calculateZoningFee($data);

        $this->assertEquals(500, $result['amount']);
        $this->assertEquals('Residential House', $result['breakdown']['type']);
    }

    public function test_calculates_residential_house_fee_default()
    {
        // No zone info
        $data = [
            'project_type' => 'new_construction',
        ];

        $result = $this->service->calculateZoningFee($data);

        $this->assertEquals(500, $result['amount']);
        $this->assertEquals('Residential House', $result['breakdown']['type']);
    }

    public function test_calculates_residential_apartment_fee_r3()
    {
        $classification = ZoningClassification::create(['code' => 'R3', 'name' => 'Residential 3']);
        $zone = Zone::create(['zoning_classification_id' => $classification->id]);

        $data = [
            'zone_id' => $zone->id,
            'floor_area_sqm' => 100,
        ];

        $result = $this->service->calculateZoningFee($data);

        // 500 + (5 * 100) = 1000
        $this->assertEquals(1000, $result['amount']);
        $this->assertEquals('Residential Apartment', $result['breakdown']['type']);
        $this->assertEquals(500, $result['breakdown']['variable_fee']);
    }

    public function test_calculates_commercial_fee_c1()
    {
        $classification = ZoningClassification::create(['code' => 'C1', 'name' => 'Commercial 1']);
        $zone = Zone::create(['zoning_classification_id' => $classification->id]);

        $data = [
            'zone_id' => $zone->id,
            'floor_area_sqm' => 50,
        ];

        $result = $this->service->calculateZoningFee($data);

        // 1000 + (10 * 50) = 1500
        $this->assertEquals(1500, $result['amount']);
        $this->assertEquals('Commercial Project', $result['breakdown']['type']);
    }

    public function test_calculates_industrial_fee_i1()
    {
        $classification = ZoningClassification::create(['code' => 'I1', 'name' => 'Industrial 1']);
        $zone = Zone::create(['zoning_classification_id' => $classification->id]);

        $data = [
            'zone_id' => $zone->id,
            'floor_area_sqm' => 100,
        ];

        $result = $this->service->calculateZoningFee($data);

        // 1500 + (15 * 100) = 3000
        $this->assertEquals(3000, $result['amount']);
        $this->assertEquals('Industrial Project', $result['breakdown']['type']);
    }

    public function test_calculates_subdivision_fee()
    {
        $data = [
            'is_subdivision' => true,
            'total_lots_planned' => 10,
        ];

        $result = $this->service->calculateZoningFee($data);

        // 1000 + (5 * 10) = 1050
        $this->assertEquals(1050, $result['amount']);
        $this->assertEquals('Subdivision Project', $result['breakdown']['type']);
    }
}
