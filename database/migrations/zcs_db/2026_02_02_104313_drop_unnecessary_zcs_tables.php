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
        // Drop unnecessary tables that are not used or are Laravel system tables
        // that should not exist in application databases

        // Drop old/unused tables
        Schema::connection('zcs_db')->dropIfExists('clearance_applications');
        Schema::connection('zcs_db')->dropIfExists('documents');

        // Drop Laravel system tables (should not be in application database)
        // Note: 'migrations' table is required by Laravel to track which migrations have run
        Schema::connection('zcs_db')->dropIfExists('cache');
        Schema::connection('zcs_db')->dropIfExists('cache_locks');
        Schema::connection('zcs_db')->dropIfExists('jobs');
        Schema::connection('zcs_db')->dropIfExists('job_batches');
        Schema::connection('zcs_db')->dropIfExists('failed_jobs');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: We don't recreate these tables as they are unnecessary
        // If rollback is needed, the original migrations would need to be restored
    }
};
