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
            $table->string('tct_no')->nullable()->after('lot_owner');
            $table->decimal('project_cost', 15, 2)->nullable()->after('purpose');
            $table->decimal('building_footprint_sqm', 10, 2)->nullable()->after('floor_area_sqm');
            $table->decimal('front_setback_m', 8, 2)->nullable()->after('building_footprint_sqm');
            $table->decimal('rear_setback_m', 8, 2)->nullable()->after('front_setback_m');
            $table->decimal('side_setback_left_m', 8, 2)->nullable()->after('rear_setback_m');
            $table->decimal('side_setback_right_m', 8, 2)->nullable()->after('side_setback_left_m');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('zcs_db')->table('zoning_applications', function (Blueprint $table) {
            $table->dropColumn([
                'tct_no',
                'project_cost',
                'building_footprint_sqm',
                'front_setback_m',
                'rear_setback_m',
                'side_setback_left_m',
                'side_setback_right_m',
            ]);
        });
    }
};
