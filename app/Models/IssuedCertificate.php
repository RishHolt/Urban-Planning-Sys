<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssuedCertificate extends SbrModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'certificate_no',
        'application_id',
        'issued_by',
        'issue_date',
        'valid_until',
        'conditions',
        'final_plat_reference',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'valid_until' => 'date',
        ];
    }

    /**
     * Get the subdivision application that owns this certificate.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(SubdivisionApplication::class, 'application_id');
    }

    /**
     * Generate a unique certificate number.
     */
    public static function generateCertificateNo(): string
    {
        $year = date('Y');
        $lastNumber = self::where('certificate_no', 'like', "SC-{$year}-%")
            ->orderBy('certificate_no', 'desc')
            ->value('certificate_no');

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -5);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return sprintf('SC-%s-%05d', $year, $newSequence);
    }
}
