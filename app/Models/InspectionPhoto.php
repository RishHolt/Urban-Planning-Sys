<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionPhoto extends Model
{
    use HasFactory;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'omt_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'INSPECTION_PHOTOS';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'inspection_id',
        'photo_path',
        'photo_description',
        'taken_at',
        'taken_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'taken_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the inspection that owns this photo.
     */
    public function inspection(): BelongsTo
    {
        return $this->belongsTo(OccupancyInspection::class, 'inspection_id');
    }

    /**
     * Get the user who took this photo.
     */
    public function takenBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'taken_by');
    }
}
