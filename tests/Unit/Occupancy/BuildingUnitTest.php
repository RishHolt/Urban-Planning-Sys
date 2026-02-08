<?php

use App\Models\Building;
use App\Models\BuildingUnit;

it('can detect overcrowding', function () {
    $building = Building::factory()->create();

    $unit = BuildingUnit::factory()->create([
        'building_id' => $building->id,
        'max_occupants' => 4,
        'current_occupant_count' => 6,
    ]);

    expect($unit->isOvercrowded())->toBeTrue();
});

it('returns false when not overcrowded', function () {
    $building = Building::factory()->create();

    $unit = BuildingUnit::factory()->create([
        'building_id' => $building->id,
        'max_occupants' => 4,
        'current_occupant_count' => 3,
    ]);

    expect($unit->isOvercrowded())->toBeFalse();
});

it('returns false when max_occupants is null', function () {
    $building = Building::factory()->create();

    $unit = BuildingUnit::factory()->create([
        'building_id' => $building->id,
        'max_occupants' => null,
        'current_occupant_count' => 10,
    ]);

    expect($unit->isOvercrowded())->toBeFalse();
});
