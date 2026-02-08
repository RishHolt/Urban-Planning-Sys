<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     */
    public function getConnection(): ?string
    {
        return 'sbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('sbr_db')->table('subdivision_applications', function (Blueprint $table) {
            // Add project_type field
            $table->enum('project_type', ['subdivision_only', 'subdivision_with_building'])
                ->default('subdivision_only')
                ->after('zoning_clearance_no');

            // Add building review fields (nullable - only for subdivision_with_building)
            $table->string('building_type', 50)->nullable()->after('open_space_percentage');
            $table->integer('number_of_floors')->nullable()->after('building_type');
            $table->decimal('building_footprint_sqm', 12, 2)->nullable()->after('number_of_floors');
            $table->decimal('total_floor_area_sqm', 12, 2)->nullable()->after('building_footprint_sqm');
            $table->decimal('front_setback_m', 8, 2)->nullable()->after('total_floor_area_sqm');
            $table->decimal('rear_setback_m', 8, 2)->nullable()->after('front_setback_m');
            $table->decimal('side_setback_m', 8, 2)->nullable()->after('rear_setback_m');
            $table->decimal('floor_area_ratio', 8, 2)->nullable()->after('side_setback_m');
            $table->decimal('building_open_space_sqm', 12, 2)->nullable()->after('floor_area_ratio');

            // Add review status fields for building review
            $table->enum('building_review_status', ['pending', 'approved', 'revision', 'denied'])
                ->nullable()
                ->after('building_open_space_sqm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->table('subdivision_applications', function (Blueprint $table) {
            $table->dropColumn([
                'project_type',
                'building_type',
                'number_of_floors',
                'building_footprint_sqm',
                'total_floor_area_sqm',
                'front_setback_m',
                'rear_setback_m',
                'side_setback_m',
                'floor_area_ratio',
                'building_open_space_sqm',
                'building_review_status',
            ]);
        });
    }
};
