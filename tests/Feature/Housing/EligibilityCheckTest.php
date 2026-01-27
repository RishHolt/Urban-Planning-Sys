<?php

use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\BeneficiaryDocument;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Services\EligibilityService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = new EligibilityService;
});

it('determines eligible application for socialized housing', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'monthly_income' => 25000,
        'years_of_residency' => 6,
        'has_existing_property' => false,
    ]);

    HouseholdMember::factory()->count(2)->create([
        'beneficiary_id' => $beneficiary->id,
        'is_dependent' => false,
        'monthly_income' => 5000,
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    // Create required documents
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'valid_id',
        'verification_status' => 'verified',
    ]);
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'birth_certificate',
        'verification_status' => 'verified',
    ]);
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'income_proof',
        'verification_status' => 'verified',
    ]);
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'barangay_certificate',
        'verification_status' => 'verified',
    ]);
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'tax_declaration',
        'verification_status' => 'verified',
    ]);

    $result = $this->service->checkEligibility($application);

    expect($result->isEligible)->toBeTrue()
        ->and($result->determination)->toBe('eligible')
        ->and($result->failedCriteria)->toBeEmpty();
});

it('rejects application with income exceeding limit', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'monthly_income' => 35000, // Exceeds 30000 limit
        'years_of_residency' => 6,
        'has_existing_property' => false,
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    $result = $this->service->checkEligibility($application);

    expect($result->isEligible)->toBeFalse()
        ->and($result->determination)->toBe('not_eligible')
        ->and($result->failedCriteria)->toContain('income');
});

it('rejects application with insufficient residency years', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'monthly_income' => 25000,
        'years_of_residency' => 3, // Less than required 5 years
        'has_existing_property' => false,
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    $result = $this->service->checkEligibility($application);

    expect($result->isEligible)->toBeFalse()
        ->and($result->failedCriteria)->toContain('residency');
});

it('rejects application with existing property when program requires no property', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'monthly_income' => 25000,
        'years_of_residency' => 6,
        'has_existing_property' => true, // Has property
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    $result = $this->service->checkEligibility($application);

    expect($result->isEligible)->toBeFalse()
        ->and($result->failedCriteria)->toContain('existing_property');
});

it('rejects application with missing required documents', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'monthly_income' => 25000,
        'years_of_residency' => 6,
        'has_existing_property' => false,
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    // Only create some documents, missing others
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'valid_id',
        'verification_status' => 'verified',
    ]);

    $result = $this->service->checkEligibility($application);

    expect($result->isEligible)->toBeFalse()
        ->and($result->failedCriteria)->toContain('documents');
});

it('calculates household income correctly including members', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'monthly_income' => 20000,
        'years_of_residency' => 6,
        'has_existing_property' => false,
    ]);

    // Add household members with income
    HouseholdMember::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'is_dependent' => false,
        'monthly_income' => 15000, // Total household income = 35000
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing', // Max income 30000
    ]);

    $result = $this->service->checkEligibility($application);

    expect($result->isEligible)->toBeFalse()
        ->and($result->failedCriteria)->toContain('income');
});
