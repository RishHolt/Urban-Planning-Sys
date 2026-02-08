<?php

use App\Models\User;
use App\Services\RecaptchaService;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\post;

beforeEach(function () {
    Mail::fake();
    config(['services.recaptcha.secret_key' => 'test-secret-key']);
});

it('requires reCAPTCHA token for login', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $response = post('/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('g-recaptcha-response');
});

it('validates reCAPTCHA token', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->with('invalid-token', \Mockery::type('string'))
            ->andReturn(false);
    });

    $response = post('/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
        'g-recaptcha-response' => 'invalid-token',
    ]);

    $response->assertSessionHasErrors('g-recaptcha-response');
});

it('sends 6-digit OTP code via email after successful login with valid captcha', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->andReturn(true);
    });

    $response = post('/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
        'g-recaptcha-response' => 'valid-token',
    ]);

    $response->assertSessionHas('email', 'test@example.com');
    $response->assertSessionHas('otp_code');

    Mail::assertSent(\App\Mail\OtpMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email) &&
            strlen($mail->code) === 6 &&
            ctype_digit($mail->code);
    });
});

it('stores login session data after successful captcha verification', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'is_active' => true,
    ]);

    $this->mock(RecaptchaService::class, function ($mock) {
        $mock->shouldReceive('verify')
            ->once()
            ->andReturn(true);
    });

    $response = post('/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
        'g-recaptcha-response' => 'valid-token',
    ]);

    $response->assertSessionHas('login_user_id', $user->id);
    $response->assertSessionHas('login_email', 'test@example.com');
    $response->assertSessionHas('verification_type', 'login');
});
