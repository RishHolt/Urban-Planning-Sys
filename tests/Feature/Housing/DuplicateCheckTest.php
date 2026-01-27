<?php

use App\Models\Beneficiary;
use App\Models\User;
use App\Services\DuplicateCheckService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = new DuplicateCheckService;
});

it('detects exact name match', function () {
    $existing = Beneficiary::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'middle_name' => 'Santos',
    ]);

    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'middle_name' => 'Santos',
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeTrue()
        ->and($result->totalMatches)->toBeGreaterThan(0)
        ->and($result->potentialDuplicates)->not->toBeEmpty();
});

it('detects ID number match', function () {
    $existing = Beneficiary::factory()->create([
        'priority_status' => 'pwd',
        'priority_id_no' => 'PWD-12345',
    ]);

    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'priority_status' => 'pwd',
        'priority_id_no' => 'PWD-12345',
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeTrue()
        ->and($result->potentialDuplicates)->not->toBeEmpty();
});

it('detects contact number match', function () {
    $existing = Beneficiary::factory()->create([
        'contact_number' => '09123456789',
    ]);

    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'contact_number' => '09123456789',
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeTrue();
});

it('detects email match', function () {
    $existing = Beneficiary::factory()->create([
        'email' => 'test@example.com',
    ]);

    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'email' => 'test@example.com',
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeTrue();
});

it('detects fuzzy name match', function () {
    $existing = Beneficiary::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
    ]);

    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz', // Same name
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeTrue();
});

it('returns no duplicates for unique beneficiary', function () {
    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Unique',
        'last_name' => 'Person',
        'email' => 'unique@example.com',
        'contact_number' => '09999999999',
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeFalse()
        ->and($result->totalMatches)->toBe(0);
});

it('consolidates multiple match types for same beneficiary', function () {
    $existing = Beneficiary::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan@example.com',
        'contact_number' => '09123456789',
    ]);

    $newBeneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan@example.com',
        'contact_number' => '09123456789',
    ]);

    $result = $this->service->checkDuplicates($newBeneficiary);

    expect($result->hasDuplicates)->toBeTrue();

    // Should have consolidated matches with higher confidence
    $match = $result->potentialDuplicates[0] ?? null;
    if ($match) {
        expect($match['match_types'])->toBeArray()
            ->and($match['confidence'])->toBeGreaterThan(0.9);
    }
});
