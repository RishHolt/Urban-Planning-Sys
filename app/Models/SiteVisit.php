<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteVisit extends Model
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
    protected $table = 'site_visits';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'beneficiary_id',
        'application_id',
        'visited_by',
        'scheduled_date',
        'visit_date',
        'address_visited',
        'living_conditions',
        'findings',
        'recommendation',
        'remarks',
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
            'scheduled_date' => 'date',
            'visit_date' => 'date',
        ];
    }

    /**
     * Get the beneficiary for this site visit.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }

    /**
     * Get the application for this site visit.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(BeneficiaryApplication::class, 'application_id');
    }
}
