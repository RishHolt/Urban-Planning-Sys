<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     */
    public function getConnection(): ?string
    {
        return 'zcs_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop old zoning application tables
        Schema::connection('zcs_db')->dropIfExists('zoning_application_status_history');
        Schema::connection('zcs_db')->dropIfExists('zoning_application_documents');
        Schema::connection('zcs_db')->dropIfExists('zoning_applications');

        // Drop old zone tables (replaced by new zones table)
        Schema::connection('zcs_db')->dropIfExists('zoning_gis_polygon');
        Schema::connection('zcs_db')->dropIfExists('zoning_classification');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration drops tables, so down() would require recreating them
        // which is complex. In practice, this migration should not be rolled back.
    }
};
