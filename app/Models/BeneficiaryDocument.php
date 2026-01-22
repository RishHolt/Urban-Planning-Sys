<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BeneficiaryDocument extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'hbr_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'beneficiary_documents';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'beneficiary_id',
        'application_id',
        'document_type',
        'file_name',
        'file_path',
        'verification_status',
        'verified_by',
        'verified_at',
        'uploaded_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'uploaded_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($document) {
            if (empty($document->uploaded_at)) {
                $document->uploaded_at = now();
            }
        });
    }

    /**
     * Get the beneficiary that owns the document.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class);
    }

    /**
     * Get the application that owns the document.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(BeneficiaryApplication::class, 'application_id');
    }
}
