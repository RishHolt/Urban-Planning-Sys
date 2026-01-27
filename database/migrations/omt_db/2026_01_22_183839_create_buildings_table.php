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
        return 'omt_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('omt_db')->create('BUILDINGS', function (Blueprint $table) {
            $table->id();
            $table->string('building_code', 30)->unique();
            $table->string('sbr_reference_no', 30)->nullable();
            $table->string('building_permit_no', 30)->nullable();
            $table->string('housing_project_code', 30)->nullable();
            $table->string('building_name')->nullable();
            $table->string('address');
            $table->decimal('pin_lat', 10, 8)->nullable();
            $table->decimal('pin_lng', 11, 8)->nullable();
            $table->string('owner_name')->nullable();
            $table->string('owner_contact', 50)->nullable();
            $table->enum('building_type', ['residential', 'commercial', 'industrial', 'mixed_use', 'institutional']);
            $table->enum('structure_source', ['sbr', 'housing', 'building_permit', 'manual']);
            $table->unsignedInteger('total_floors')->default(1);
            $table->unsignedInteger('total_units')->default(0);
            $table->decimal('total_floor_area_sqm', 12, 2)->nullable();
            $table->enum('occupancy_status', ['vacant', 'partially_occupied', 'fully_occupied', 'under_construction', 'condemned'])->default('vacant');
            $table->date('certificate_of_occupancy_date')->nullable();
            $table->date('last_inspection_date')->nullable();
            $table->date('next_inspection_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('building_code');
            $table->index('sbr_reference_no');
            $table->index('building_permit_no');
            $table->index('housing_project_code');
            $table->index('occupancy_status');
            $table->index('next_inspection_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('BUILDINGS');
    }
};
