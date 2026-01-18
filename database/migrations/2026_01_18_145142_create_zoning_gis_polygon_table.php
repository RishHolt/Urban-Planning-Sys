<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Get the migration connection name.
     */
    public function getConnection(): ?string
    {
        return 'zcs_db';
    }

    public function up(): void
    {
        Schema::connection('zcs_db')->create('zoning_gis_polygon', function (Blueprint $table) {
            $table->id('polygon_id');
            $table->unsignedBigInteger('zoning_id');
            $table->string('barangay', 100)->nullable();
            $table->decimal('area_sqm', 12, 2)->nullable();
            $table->json('geometry'); // Store GeoJSON as JSON
            $table->timestamps();

            $table->foreign('zoning_id')->references('zoning_id')->on('zoning_classification')->onDelete('cascade');
            $table->index('zoning_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zoning_gis_polygon');
    }
};
