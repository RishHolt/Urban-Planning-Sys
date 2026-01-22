<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $code,
        public string $type,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Verification Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $typeLabels = [
            'registration' => 'account registration',
            'login' => 'login',
            'password_reset' => 'password reset',
            'email_change' => 'email change',
        ];

        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->code,
                'type' => $this->type,
                'typeLabel' => $typeLabels[$this->type] ?? $this->type,
                'expiryMinutes' => 5,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
