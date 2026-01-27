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
        Schema::connection('hbr_db')->create('housing_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('housing_projects')->onDelete('cascade');

            // Unit Identification
            $table->string('unit_no')->unique();
            $table->string('block_no')->nullable();
            $table->string('lot_no')->nullable();
            $table->unsignedInteger('floor_number')->nullable();

            // Unit Type
            $table->enum('unit_type', ['single_detached', 'duplex', 'rowhouse', 'apartment', 'condominium']);

            // Unit Specifications
            $table->decimal('floor_area_sqm', 10, 2);

            // Status
            $table->enum('status', ['available', 'reserved', 'allocated', 'occupied', 'maintenance'])->default('available');

            $table->timestamps();

            // Indexes
            $table->index('project_id');
            $table->index('unit_no');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('hbr_db')->dropIfExists('housing_units');
    }
};
