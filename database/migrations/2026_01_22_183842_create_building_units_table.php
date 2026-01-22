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
        Schema::connection('omt_db')->create('BUILDING_UNITS', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('BUILDINGS', 'id')->onDelete('cascade');
            $table->string('unit_no', 20);
            $table->unsignedInteger('floor_number')->default(1);
            $table->enum('unit_type', ['residential', 'commercial', 'office', 'warehouse', 'parking', 'storage']);
            $table->decimal('floor_area_sqm', 10, 2)->nullable();
            $table->unsignedInteger('max_occupants')->nullable();
            $table->unsignedInteger('current_occupant_count')->default(0);
            $table->enum('status', ['vacant', 'occupied', 'reserved', 'under_renovation', 'maintenance'])->default('vacant');
            $table->string('current_occupant_name', 150)->nullable();
            $table->date('occupancy_start_date')->nullable();
            $table->date('last_inspection_date')->nullable();
            $table->date('next_inspection_date')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique(['building_id', 'unit_no']);
            $table->index('building_id');
            $table->index('unit_no');
            $table->index('status');
            $table->index(['max_occupants', 'current_occupant_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('BUILDING_UNITS');
    }
};
