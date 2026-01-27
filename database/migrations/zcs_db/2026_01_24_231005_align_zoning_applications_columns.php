<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            // Rename columns to match model and service expectations
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'latitude')) {
                $table->renameColumn('latitude', 'pin_lat');
            }
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'longitude')) {
                $table->renameColumn('longitude', 'pin_lng');
            }
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'land_type')) {
                $table->renameColumn('land_type', 'land_use_type');
            }
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'rejection_reason')) {
                $table->renameColumn('rejection_reason', 'denial_reason');
            }
            
            // Add missing project_type column
            if (!Schema::connection('zcs_db')->hasColumn('zoning_applications', 'project_type')) {
                $table->string('project_type', 50)->nullable()->after('application_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'pin_lat')) {
                $table->renameColumn('pin_lat', 'latitude');
            }
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'pin_lng')) {
                $table->renameColumn('pin_lng', 'longitude');
            }
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'land_use_type')) {
                $table->renameColumn('land_use_type', 'land_type');
            }
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'denial_reason')) {
                $table->renameColumn('denial_reason', 'rejection_reason');
            }
            
            if (Schema::connection('zcs_db')->hasColumn('zoning_applications', 'project_type')) {
                $table->dropColumn('project_type');
            }
        });
    }
};
