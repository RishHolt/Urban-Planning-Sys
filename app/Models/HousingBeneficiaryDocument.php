<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HousingBeneficiaryDocument extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'hbr_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'housing_beneficiary_application_id',
        'document_type',
        'type',
        'manual_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'status',
        'reviewed_by',
        'reviewed_at',
        'notes',
        'version',
        'parent_document_id',
        'is_current',
        'replaced_by',
        'replaced_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'reviewed_at' => 'datetime',
            'version' => 'integer',
            'is_current' => 'boolean',
            'replaced_at' => 'datetime',
        ];
    }

    /**
     * Get the application that owns the document.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(HousingBeneficiaryApplication::class, 'housing_beneficiary_application_id');
    }

    /**
     * Get the parent document (previous version).
     */
    public function parentDocument(): BelongsTo
    {
        return $this->belongsTo(HousingBeneficiaryDocument::class, 'parent_document_id');
    }

    /**
     * Get all versions of this document.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(HousingBeneficiaryDocument::class, 'parent_document_id')->orderBy('version', 'desc');
    }
}
