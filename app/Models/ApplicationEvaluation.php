<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationEvaluation extends Model
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
        'application_id',
        'evaluated_by',
        'evaluation_type',
        'evaluation_notes',
        'remarks',
        'evaluation_criteria',
        'recommendation',
        'priority_score',
        'eligibility_score',
        'evaluated_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'evaluation_criteria' => 'array',
            'priority_score' => 'integer',
            'eligibility_score' => 'integer',
            'evaluated_at' => 'datetime',
        ];
    }

    /**
     * Get the application for this evaluation.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(BeneficiaryApplication::class);
    }

    /**
     * Get the user who performed this evaluation.
     */
    public function evaluator(): BelongsTo
    {
        return $this->setConnection('user_db')->belongsTo(\App\Models\User::class, 'evaluated_by');
    }
}
