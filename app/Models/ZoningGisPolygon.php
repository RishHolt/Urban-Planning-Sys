<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZoningGisPolygon extends Model
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
    protected $table = 'zoning_gis_polygon';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'polygon_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'zoning_id',
        'barangay',
        'area_sqm',
        'geometry',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'area_sqm' => 'decimal:2',
            'geometry' => 'array', // Cast JSON to array for GeoJSON
        ];
    }

    /**
     * Get the zoning classification that owns the GIS polygon.
     */
    public function zoningClassification(): BelongsTo
    {
        return $this->belongsTo(ZoningClassification::class, 'zoning_id', 'zoning_id');
    }
}
