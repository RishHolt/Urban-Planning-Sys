<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InfrastructureProjectDocument extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'ipc_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'project_documents';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'document_type',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
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
     * Get the project that owns the document.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(InfrastructureProject::class, 'project_id');
    }
}
