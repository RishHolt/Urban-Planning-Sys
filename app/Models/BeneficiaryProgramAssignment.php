<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BeneficiaryProgramAssignment extends Model
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
        'housing_beneficiary_id',
        'household_id',
        'housing_program_id',
        'assigned_date',
        'status',
        'notes',
        'assigned_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_date' => 'date',
        ];
    }

    /**
     * Get the beneficiary for this assignment.
     */
    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(HousingBeneficiary::class, 'housing_beneficiary_id');
    }

    /**
     * Get the household for this assignment.
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the program for this assignment.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(HousingProgram::class, 'housing_program_id');
    }
}
