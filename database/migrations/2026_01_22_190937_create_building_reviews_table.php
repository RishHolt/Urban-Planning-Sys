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
        Schema::connection('sbr_db')->create('building_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('pl_reference_no', 30)->unique(); // Reference from Permit & Licensing
            $table->string('zoning_clearance_no', 30); // Fetched from P&L
            $table->string('building_permit_no', 30); // Fetched from P&L
            $table->string('applicant_name', 150);
            $table->string('contact_number', 20);
            $table->string('project_address', 255);
            $table->text('project_description')->nullable();
            $table->integer('number_of_storeys')->nullable();
            $table->decimal('floor_area_sqm', 10, 2)->nullable();
            $table->enum('status', ['fetched', 'under_review', 'approved', 'denied', 'posted'])->default('fetched');
            $table->text('denial_reason')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('pl_reference_no', 'idx_building_pl_ref');
            $table->index('building_permit_no', 'idx_building_permit');
            $table->index('zoning_clearance_no', 'idx_building_zoning');
            $table->index('status', 'idx_building_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('sbr_db')->dropIfExists('building_reviews');
    }
};
