<?php

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
});

it('can view buildings index', function () {
    actingAs($this->user)
        ->get('/admin/occupancy/buildings')
        ->assertSuccessful();
});

it('can view building dashboard', function () {
    actingAs($this->user)
        ->get('/admin/occupancy/dashboard')
        ->assertSuccessful();
});

it('requires authentication to view buildings', function () {
    get('/admin/occupancy/buildings')
        ->assertRedirect('/login');
});
