<?php

use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\BeneficiaryDocument;
use App\Models\User;
use App\Services\ApplicationValidationService;
use App\Services\DuplicateCheckService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $duplicateService = new DuplicateCheckService;
    $this->service = new ApplicationValidationService($duplicateService);
});

it('validates complete application successfully', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'civil_status' => 'single',
        'email' => 'juan@example.com',
        'contact_number' => '09123456789',
        'current_address' => '123 Test St',
        'barangay' => 'Test Barangay',
        'years_of_residency' => 5,
        'employment_status' => 'employed',
        'monthly_income' => 25000,
        'priority_status' => 'none',
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    // Create all required documents
    $requiredDocs = ['valid_id', 'birth_certificate', 'income_proof', 'barangay_certificate', 'tax_declaration'];
    foreach ($requiredDocs as $docType) {
        BeneficiaryDocument::factory()->create([
            'application_id' => $application->id,
            'beneficiary_id' => $beneficiary->id,
            'document_type' => $docType,
            'verification_status' => 'verified',
        ]);
    }

    $result = $this->service->validateApplication($application);

    expect($result->isValid)->toBeTrue()
        ->and($result->readinessStatus)->toBe('ready')
        ->and($result->missingFields)->toBeEmpty()
        ->and($result->missingDocuments)->toBeEmpty();
});

it('detects missing mandatory fields', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => null, // Missing
        'birth_date' => null, // Missing
        'email' => null, // Missing
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    $result = $this->service->validateApplication($application);

    expect($result->isValid)->toBeFalse()
        ->and($result->readinessStatus)->toBe('incomplete')
        ->and($result->missingFields)->not->toBeEmpty();
});

it('detects missing required documents', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'civil_status' => 'single',
        'email' => 'juan@example.com',
        'contact_number' => '09123456789',
        'current_address' => '123 Test St',
        'barangay' => 'Test Barangay',
        'years_of_residency' => 5,
        'employment_status' => 'employed',
        'monthly_income' => 25000,
        'priority_status' => 'none',
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    // Only create one document, missing others
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'valid_id',
        'verification_status' => 'verified',
    ]);

    $result = $this->service->validateApplication($application);

    expect($result->isValid)->toBeFalse()
        ->and($result->readinessStatus)->toBe('missing_documents')
        ->and($result->missingDocuments)->not->toBeEmpty();
});

it('flags duplicate warnings', function () {
    // Create existing beneficiary
    Beneficiary::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan@example.com',
    ]);

    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan@example.com',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'civil_status' => 'single',
        'contact_number' => '09123456789',
        'current_address' => '123 Test St',
        'barangay' => 'Test Barangay',
        'years_of_residency' => 5,
        'employment_status' => 'employed',
        'monthly_income' => 25000,
        'priority_status' => 'none',
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    $result = $this->service->validateApplication($application);

    expect($result->readinessStatus)->toBe('has_duplicates')
        ->and($result->duplicateWarnings)->not->toBeEmpty();
});

it('detects invalid documents that need replacement', function () {
    $beneficiary = Beneficiary::factory()->create([
        'citizen_id' => $this->user->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'civil_status' => 'single',
        'email' => 'juan@example.com',
        'contact_number' => '09123456789',
        'current_address' => '123 Test St',
        'barangay' => 'Test Barangay',
        'years_of_residency' => 5,
        'employment_status' => 'employed',
        'monthly_income' => 25000,
        'priority_status' => 'none',
    ]);

    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'housing_program' => 'socialized_housing',
    ]);

    // Create document but mark as invalid
    BeneficiaryDocument::factory()->create([
        'application_id' => $application->id,
        'beneficiary_id' => $beneficiary->id,
        'document_type' => 'valid_id',
        'verification_status' => 'invalid',
    ]);

    $result = $this->service->validateApplication($application);

    expect($result->isValid)->toBeFalse()
        ->and($result->missingDocuments)->not->toBeEmpty();
});
