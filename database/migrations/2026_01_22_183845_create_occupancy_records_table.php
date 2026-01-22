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
        Schema::connection('omt_db')->create('OCCUPANCY_RECORDS', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('BUILDINGS', 'id')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('BUILDING_UNITS', 'id')->onDelete('cascade');
            $table->enum('record_type', ['move_in', 'move_out', 'transfer', 'renewal', 'update']);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('occupancy_type', ['owner_occupied', 'rented', 'leased', 'commercial_tenant']);
            $table->text('purpose_of_use')->nullable();
            $table->enum('compliance_status', ['compliant', 'non_compliant', 'pending_review', 'conditional'])->default('pending_review');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('recorded_by'); // References users table in user_db
            $table->timestamps();

            // Indexes
            $table->index('building_id');
            $table->index('unit_id');
            $table->index('compliance_status');
            $table->index(['start_date', 'end_date']);
            $table->index('recorded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('omt_db')->dropIfExists('OCCUPANCY_RECORDS');
    }
};
