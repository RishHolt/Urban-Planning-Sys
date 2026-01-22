<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubdivisionDocument extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'sbr_db';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'application_id',
        'document_type',
        'stage',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_at',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'uploaded_at' => 'datetime',
        ];
    }

    /**
     * Get the subdivision application that owns this document.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(SubdivisionApplication::class, 'application_id');
    }
}
