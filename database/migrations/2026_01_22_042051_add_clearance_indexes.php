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
        Schema::connection('zcs_db')->table('clearance_applications', function ($table) {
            // Additional indexes for clearance_applications
            $table->index('reference_no', 'idx_application_ref');
            $table->index('application_category', 'idx_application_category');
        });

        Schema::connection('zcs_db')->table('issued_clearances', function ($table) {
            // Additional indexes for issued_clearances
            $table->index('clearance_no', 'idx_clearance_no');
            $table->index('status', 'idx_clearance_status');
            $table->index('valid_until', 'idx_clearance_validity');
        });

        Schema::connection('zcs_db')->table('zones', function ($table) {
            // Additional indexes for zones
            $table->index('code', 'idx_zone_code');
            $table->index('is_active', 'idx_zone_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('clearance_applications', function ($table) {
            $table->dropIndex('idx_application_ref');
            $table->dropIndex('idx_application_category');
        });

        Schema::connection('zcs_db')->table('issued_clearances', function ($table) {
            $table->dropIndex('idx_clearance_no');
            $table->dropIndex('idx_clearance_status');
            $table->dropIndex('idx_clearance_validity');
        });

        Schema::connection('zcs_db')->table('zones', function ($table) {
            $table->dropIndex('idx_zone_code');
            $table->dropIndex('idx_zone_active');
        });
    }
};
