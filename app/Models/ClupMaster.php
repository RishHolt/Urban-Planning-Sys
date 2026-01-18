<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClupMaster extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'zcs_db';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'clup_master';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'clup_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lgu_name',
        'reference_no',
        'coverage_start_year',
        'coverage_end_year',
        'approval_date',
        'approving_body',
        'resolution_no',
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
            'approval_date' => 'date',
        ];
    }

    /**
     * Get the zoning classifications for the CLUP.
     */
    public function zoningClassifications(): HasMany
    {
        return $this->hasMany(ZoningClassification::class, 'clup_id', 'clup_id');
    }
}
