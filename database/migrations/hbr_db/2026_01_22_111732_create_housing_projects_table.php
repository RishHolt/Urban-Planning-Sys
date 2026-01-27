<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Get the migration connection name.
     * Uses 'hbr_db' connection for HBR database.
     */
    public function getConnection(): ?string
    {
        return 'hbr_db';
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('hbr_db')->create('housing_projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code')->unique();
            $table->string('project_name');
            $table->string('location');
            $table->string('barangay');
            $table->decimal('pin_lat', 10, 8)->nullable();
            $table->decimal('pin_lng', 11, 8)->nullable();

            // Zoning Clearance Reference (cross-system)
            $table->string('zoning_clearance_no')->nullable();

            // Project Source
            $table->enum('project_source', ['lgu_built', 'nha', 'shfc', 'private_developer']);
            $table->string('source_reference')->nullable();

            // Housing Program
            $table->enum('housing_program', ['socialized_housing', 'relocation', 'rental_subsidy', 'housing_loan']);

            // Unit Statistics
            $table->unsignedInteger('total_units')->default(0);
            $table->unsignedInteger('available_units')->default(0);
            $table->unsignedInteger('allocated_units')->default(0);
            $table->unsignedInteger('occupied_units')->default(0);

            // Unit Specifications
            $table->decimal('lot_area_sqm', 10, 2)->nullable();
            $table->decimal('unit_floor_area_sqm', 10, 2)->nullable();
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->decimal('monthly_amortization', 12, 2)->nullable();

            // Project Status
            $table->enum('project_status', ['planning', 'under_construction', 'completed', 'fully_allocated'])->default('planning');
            $table->date('completion_date')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('project_code');
            $table->index('zoning_clearance_no');
            $table->index('project_status');
            $table->index('housing_program');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('housing_projects');
    }
};
