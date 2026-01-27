<?php

use App\Models\AuditLog;
use App\Models\Beneficiary;
use App\Models\BeneficiaryApplication;
use App\Models\User;
use App\Services\StatusTrackingService;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->service = new StatusTrackingService;
});

it('updates application status and logs to audit trail', function () {
    $beneficiary = Beneficiary::factory()->create();
    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'application_status' => 'submitted',
    ]);

    $this->actingAs($this->user);

    $this->service->updateStatus($application, 'under_review', 'Initial review started');

    $application->refresh();

    expect($application->application_status)->toBe('under_review')
        ->and($application->reviewed_by)->toBe($this->user->id)
        ->and($application->reviewed_at)->not->toBeNull();

    // Check audit log
    $auditLog = AuditLog::where('resource_type', 'beneficiary_application')
        ->where('resource_id', (string) $application->id)
        ->where('action', 'status_updated')
        ->first();

    expect($auditLog)->not->toBeNull()
        ->and($auditLog->changes['status_from'])->toBe('submitted')
        ->and($auditLog->changes['status_to'])->toBe('under_review');
});

it('validates status transitions', function () {
    $beneficiary = Beneficiary::factory()->create();
    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'application_status' => 'submitted',
    ]);

    $this->actingAs($this->user);

    // Valid transition
    expect(fn () => $this->service->updateStatus($application, 'under_review'))
        ->not->toThrow(\InvalidArgumentException::class);

    // Invalid transition
    $application->update(['application_status' => 'submitted']);
    expect(fn () => $this->service->updateStatus($application, 'allocated'))
        ->toThrow(\InvalidArgumentException::class);
});

it('updates timestamps based on status', function () {
    $beneficiary = Beneficiary::factory()->create();
    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'application_status' => 'submitted',
        'reviewed_at' => null,
        'approved_at' => null,
    ]);

    $this->actingAs($this->user);

    // Update to under_review should set reviewed_at
    $this->service->updateStatus($application, 'under_review');
    $application->refresh();

    expect($application->reviewed_at)->not->toBeNull()
        ->and($application->reviewed_by)->toBe($this->user->id);

    // Update to eligible should set approved_at
    $application->update(['eligibility_status' => 'eligible']);
    $this->service->updateStatus($application, 'eligible');
    $application->refresh();

    expect($application->approved_at)->not->toBeNull()
        ->and($application->approved_by)->toBe($this->user->id);
});

it('retrieves status history for application', function () {
    $beneficiary = Beneficiary::factory()->create();
    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'application_status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $this->actingAs($this->user);

    // Make some status changes
    $this->service->updateStatus($application, 'under_review', 'Review started');
    $this->service->updateStatus($application, 'site_visit_scheduled', 'Site visit scheduled');

    $history = $this->service->getStatusHistory($application);

    expect($history)->toBeArray()
        ->and(count($history))->toBeGreaterThanOrEqual(3)
        ->and($history[0]['status'])->toBe('submitted')
        ->and($history[1]['status'])->toBe('under_review')
        ->and($history[2]['status'])->toBe('site_visit_scheduled');
});

it('prevents invalid status transitions from terminal states', function () {
    $beneficiary = Beneficiary::factory()->create();
    $application = BeneficiaryApplication::factory()->create([
        'beneficiary_id' => $beneficiary->id,
        'application_status' => 'cancelled',
    ]);

    $this->actingAs($this->user);

    // Cannot transition from cancelled (terminal state)
    expect(fn () => $this->service->updateStatus($application, 'under_review'))
        ->toThrow(\InvalidArgumentException::class);
});
