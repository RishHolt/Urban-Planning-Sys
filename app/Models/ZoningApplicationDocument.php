<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZoningApplicationDocument extends ZcsModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'zoning_application_id',
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
     * Get the zoning application that owns the document.
     */
    public function zoningApplication(): BelongsTo
    {
        return $this->belongsTo(ZoningApplication::class);
    }

    /**
     * Get the parent document (previous version).
     */
    public function parentDocument(): BelongsTo
    {
        return $this->belongsTo(ZoningApplicationDocument::class, 'parent_document_id');
    }

    /**
     * Get all versions of this document.
     */
    public function versions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ZoningApplicationDocument::class, 'parent_document_id')->orderBy('version', 'desc');
    }
}
