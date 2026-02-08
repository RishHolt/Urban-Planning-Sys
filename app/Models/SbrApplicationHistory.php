<?php

namespace App\Models;

class SbrApplicationHistory extends SbrModel
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'application_history';

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
        'application_type',
        'application_id',
        'status',
        'remarks',
        'updated_by',
        'updated_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'updated_at' => 'datetime',
        ];
    }
}
