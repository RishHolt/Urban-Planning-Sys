<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZoningClassification extends Model
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
    protected $table = 'zoning_classification';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'zoning_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'clup_id',
        'zoning_code',
        'zone_name',
        'land_use_category',
        'allowed_uses',
        'conditional_uses',
        'prohibited_uses',
    ];

    /**
     * Get the CLUP that owns the zoning classification.
     */
    public function clup(): BelongsTo
    {
        return $this->belongsTo(ClupMaster::class, 'clup_id', 'clup_id');
    }

    /**
     * Get the GIS polygons for the zoning classification.
     */
    public function gisPolygons(): HasMany
    {
        return $this->hasMany(ZoningGisPolygon::class, 'zoning_id', 'zoning_id');
    }
}
