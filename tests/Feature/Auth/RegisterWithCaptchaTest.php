<?php

use App\Models\User;
use App\Services\RecaptchaService;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\post;

beforeEach(function () {
    Mail::fake();
    config(['services.recaptcha.secret_key' => 'test-secret-key']);
});

it('requires reCAPTCHA token for registration', function () {
    $response = post('/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'newuser@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'mobile_number' => '09123456789',
        'address' => '123 Main St',
        'street' => 'Main Street',
        'barangay' => 'Barangay 1',
        'city' => 'Manila',
    ]);

    $response->assertSessionHasErrors('g-recaptcha-response');
});

it('validates reCAPTCHA token during registration', function () {
    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->with('invalid-token', \Mockery::type('string'))
            ->andReturn(false);
    });

    $response = post('/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'newuser@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'mobile_number' => '09123456789',
        'address' => '123 Main St',
        'street' => 'Main Street',
        'barangay' => 'Barangay 1',
        'city' => 'Manila',
        'g-recaptcha-response' => 'invalid-token',
    ]);

    $response->assertSessionHasErrors('g-recaptcha-response');
});

it('creates user and sends 6-digit OTP code via email with valid captcha', function () {
    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->andReturn(true);
    });

    $response = post('/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'newuser@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'mobile_number' => '09123456789',
        'address' => '123 Main St',
        'street' => 'Main Street',
        'barangay' => 'Barangay 1',
        'city' => 'Manila',
        'g-recaptcha-response' => 'valid-token',
    ]);

    $response->assertRedirect(route('verify-otp.show'));
    $response->assertSessionHas('email', 'newuser@example.com');
    $response->assertSessionHas('otp_code');

    expect(User::where('email', 'newuser@example.com')->exists())->toBeTrue();

    Mail::assertSent(\App\Mail\OtpMail::class, function ($mail) {
        return $mail->hasTo('newuser@example.com') &&
            strlen($mail->code) === 6 &&
            ctype_digit($mail->code) &&
            $mail->type === 'registration';
    });
});

it('stores registration session data after successful captcha verification', function () {
    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->andReturn(true);
    });

    $response = post('/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'newuser@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'mobile_number' => '09123456789',
        'address' => '123 Main St',
        'street' => 'Main Street',
        'barangay' => 'Barangay 1',
        'city' => 'Manila',
        'g-recaptcha-response' => 'valid-token',
    ]);

    $user = User::where('email', 'newuser@example.com')->first();

    $response->assertSessionHas('registration_user_id', $user->id);
    $response->assertSessionHas('registration_email', 'newuser@example.com');
    $response->assertSessionHas('verification_type', 'registration');
});

it('creates user profile during registration', function () {
    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->andReturn(true);
    });

    post('/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'middle_name' => 'Middle',
        'suffix' => 'Jr.',
        'email' => 'newuser@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'mobile_number' => '09123456789',
        'address' => '123 Main St',
        'street' => 'Main Street',
        'barangay' => 'Barangay 1',
        'city' => 'Manila',
        'g-recaptcha-response' => 'valid-token',
    ]);

    $user = User::where('email', 'newuser@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->profile)->not->toBeNull();
    expect($user->profile->first_name)->toBe('John');
    expect($user->profile->last_name)->toBe('Doe');
    expect($user->profile->middle_name)->toBe('Middle');
    expect($user->profile->suffix)->toBe('Jr.');
    expect($user->profile->mobile_number)->toBe('09123456789');
});
